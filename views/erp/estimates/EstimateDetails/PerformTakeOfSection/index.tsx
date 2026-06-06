'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Estimate, SavedPolygon, TakeoffData } from '@/types'
import { GoogleMap, Polygon, Polyline, OverlayViewF } from '@react-google-maps/api'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { SpinnerCustom } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Maximize2, Minimize2, Search, Camera } from 'lucide-react'
import html2canvas from 'html2canvas'
import * as turf from '@turf/turf' // IMPORT TURF
import { NIGHT_MODE_STYLES, POLYGON_COLORS } from '@/constants/take-off-data'
import EstimateService from '@/services/api/estimates/estimates.service'
import { MeasurementsPanel } from './MeasurementsPanel'
import { Separator } from '@/components/ui/separator'
import DrawingTools from './DrawingTools'
import { useGoogleMaps } from '@/hocs/GoogleMapProvider'

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

const PerformTakeOfSection = ({ estimate }: { estimate: Estimate }) => {
  // const { isLoaded } = useLoadScript({
  //   id: 'google-map-script',
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  //   libraries
  // })
  // const isLoaded = typeof window !== 'undefined' && !!window.google
  const { isLoaded } = useGoogleMaps()

  const mapRef = useRef<google.maps.Map | null>(null)

  // New ref for the container div to capture screenshot
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [mapCenter, setMapCenter] = useState(estimate?.take_off_data?.center || defaultCenter)
  const [markerPosition, setMarkerPosition] = useState(estimate?.take_off_data?.center || defaultCenter)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [activeTool, setActiveTool] = useState<'polygon' | 'cut' | 'hand' | null>(null)
  const [polygons, setPolygons] = useState<SavedPolygon[]>(estimate?.take_off_data?.polygons || [])
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null)
  const [mapDraggable, setMapDraggable] = useState(true)
  const [selectedPolygonForCut, setSelectedPolygonForCut] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [mapZoom, setMapZoom] = useState(18)
  const autocompleteContainerRef = useRef<HTMLDivElement>(null)
  const isCompletingPolygon = useRef(false)
  const [draftPolygon, setDraftPolygon] = useState<google.maps.LatLngLiteral[]>([])
  const [mousePosition, setMousePosition] = useState<google.maps.LatLngLiteral | null>(null)

  const address = useMemo(() => {
    return estimate?.address
      ? `${estimate?.address?.street_address}, ${estimate.address?.city?.name}, ${estimate.address?.state?.name} ${estimate.address?.zip_code}` ||
          null
      : null
  }, [estimate])

  const totalArea = useMemo(() => {
    const total = polygons.reduce(
      (acc, polygon) => {
        acc.squareFeet += polygon.area.squareFeet
        acc.squareMeters += polygon.area.squareMeters

        return acc
      },
      { squareFeet: 0, squareMeters: 0 }
    )

    return total
  }, [polygons])

  // A callback to handle the map loading
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onMapUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  // Add this effect after the geocoding effect
  useEffect(() => {
    // Trigger a re-render of polygons after map is loaded
    if (mapRef.current && polygons.length > 0) {
      // Force map to refresh and display polygons
      mapRef.current.setZoom(20)
    }
  }, [mapRef.current, isLoaded])

  // Also, ensure polygons from estimate load properly:
  useEffect(() => {
    if (estimate?.take_off_data?.polygons && polygons.length === 0) {
      setPolygons(estimate.take_off_data.polygons)
    }
  }, [estimate?.take_off_data?.polygons])

  // Geocode the address
  useEffect(() => {
    if (isLoaded && address && window.google) {
      setIsLoadingLocation(true)
      const geocoder = new google.maps.Geocoder()

      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location

          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          }

          setMapCenter(coordinates)
          setMarkerPosition(coordinates)
        }

        setIsLoadingLocation(false)
      })
    }
  }, [isLoaded, address])

  // Updated Area Calculation to handle paths with holes
  const calculateAreaAndPerimeter = (paths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][]) => {
    if (!window.google) {
      return {
        area: { squareFeet: 0, squareMeters: 0 },
        perimeter: { yards: 0, meters: 0 }
      }
    }

    let areaInSquareMeters = 0
    let perimeterMeters = 0

    // Check if paths is simple array or array of arrays
    // Simple array = no holes. Array of arrays = [outer, inner1, inner2...]
    const isSimplePoly = paths.length > 0 && !Array.isArray((paths as any)[0])

    // Normalize to Array of Arrays for calculation
    const polygonPaths = isSimplePoly
      ? [paths as google.maps.LatLngLiteral[]]
      : (paths as google.maps.LatLngLiteral[][])

    // Calculate Area
    // The area of a polygon with holes is Area(Outer) - Area(Inner1) - Area(Inner2)...
    polygonPaths.forEach((path, index) => {
      const latLngPath = path.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
      const pathArea = google.maps.geometry.spherical.computeArea(latLngPath)

      if (index === 0) {
        // Outer ring: Add area
        areaInSquareMeters += pathArea
      } else {
        // Inner rings (holes): Subtract area
        areaInSquareMeters -= pathArea
      }

      // Calculate Perimeter
      // Perimeter is sum of all ring perimeters
      for (let i = 0; i < latLngPath.length; i++) {
        const current = latLngPath[i]
        const next = latLngPath[(i + 1) % latLngPath.length]

        perimeterMeters += google.maps.geometry.spherical.computeDistanceBetween(current, next)
      }
    })

    const areaInSquareFeet = areaInSquareMeters * 10.7639
    const perimeterYards = perimeterMeters * 1.09361

    return {
      area: { squareFeet: Math.max(0, areaInSquareFeet), squareMeters: Math.max(0, areaInSquareMeters) },
      perimeter: { yards: perimeterYards, meters: perimeterMeters }
    }
  }

  const subtractPolygon = (
    originalPaths: google.maps.LatLngLiteral[] | google.maps.LatLngLiteral[][],
    cutPaths: google.maps.LatLngLiteral[]
  ) => {
    try {
      // 1. Convert Google Maps Paths to Turf Polygon (GeoJSON)
      // Note: Google Maps uses {lat, lng}, Turf uses [lng, lat]

      // Helper to convert GMaps path to Ring (closing the loop)
      const toRing = (path: google.maps.LatLngLiteral[]) => {
        const ring = path.map(p => [p.lng, p.lat])

        if (ring.length > 0) {
          // Ensure ring is closed
          const first = ring[0]
          const last = ring[ring.length - 1]

          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first)
          }
        }

        return ring
      }

      let mainPolyFeature

      // Check if original is simple or complex (has holes)
      const isSimple = originalPaths.length > 0 && !Array.isArray((originalPaths as any)[0])

      if (isSimple) {
        // Single ring
        const ring = toRing(originalPaths as google.maps.LatLngLiteral[])

        mainPolyFeature = turf.polygon([ring])
      } else {
        // Multiple rings (Outer + Holes)
        const rings = (originalPaths as google.maps.LatLngLiteral[][]).map(toRing)

        mainPolyFeature = turf.polygon(rings)
      }

      // 2. Convert Cut Path to Turf Polygon
      const cutRing = toRing(cutPaths)
      const cutPolyFeature = turf.polygon([cutRing])

      // 3. Perform Difference
      const difference = turf.difference(turf.featureCollection([mainPolyFeature, cutPolyFeature]))

      if (!difference) {
        toast.error('Cut removed the entire polygon')

        return null
      }

      // 4. Convert back to Google Maps Paths
      // Turf might return a Polygon (single shape, maybe with holes) or MultiPolygon (multiple shapes)

      const convertCoordsToGMaps = (coords: any[]) => {
        return coords.map((c: any) => ({ lat: c[1], lng: c[0] }))
      }

      if (difference.geometry.type === 'Polygon') {
        const rings = difference.geometry.coordinates

        // rings[0] is outer, rings[1+] are holes
        return rings.map(convertCoordsToGMaps)
      } else if (difference.geometry.type === 'MultiPolygon') {
        // If the cut split the polygon into two islands, we just take the first one
        // or we could merge them. For this app, let's take the largest or just Flatten.
        // Google Maps `paths` prop supports multiple outer rings if passed correctly,
        // but usually it's best to stick to one Polygon object = one geometry.
        // We will return the coordinates of the first polygon in the set.
        const firstPolyRings = difference.geometry.coordinates[0]

        return firstPolyRings.map(convertCoordsToGMaps)
      }

      return originalPaths
    } catch (error) {
      console.error('Subtraction error:', error)
      toast.error('Failed to apply cut logic')

      return originalPaths
    }
  }

  // Helper to ensure proper winding order (Outer CW, Inner CCW) for cutting holes
  const ensureOppositeWinding = (rings: google.maps.LatLngLiteral[][]) => {
    if (rings.length <= 1) return rings
    const isOuterCW = google.maps.geometry.spherical.computeSignedArea(rings[0]) < 0

    return rings.map((ring, idx) => {
      if (idx === 0) return ring // keep outer as is
      const isInnerCW = google.maps.geometry.spherical.computeSignedArea(ring) < 0

      if (isOuterCW === isInnerCW) {
        return [...ring].reverse() // reverse if same
      }

      return ring
    })
  }

  // Handle polygon completion
  const handlePolygonComplete = useCallback(
    (coordinates: google.maps.LatLngLiteral[]) => {
      // If cut tool is active and a polygon is selected
      if (activeTool === 'cut' && selectedPolygonForCut) {
        const targetPolygon = polygons.find(p => p.id === selectedPolygonForCut)

        if (targetPolygon) {
          try {
            // Perform subtraction
            const resultPaths = subtractPolygon(targetPolygon.paths, coordinates)

            if (!resultPaths) {
              return
            }

            // Ensure proper winding order for holes so Maps API renders them
            let finalPaths = resultPaths

            if (Array.isArray((resultPaths as any)[0])) {
              finalPaths = ensureOppositeWinding(resultPaths as google.maps.LatLngLiteral[][])
            }

            const { area, perimeter } = calculateAreaAndPerimeter(finalPaths)

            setPolygons(prev =>
              prev.map(p =>
                p.id === selectedPolygonForCut
                  ? {
                      ...p,
                      paths: finalPaths, // Now supports holes
                      area,
                      perimeter
                    }
                  : p
              )
            )

            const removedArea = targetPolygon.area.squareFeet - area.squareFeet

            toast.success(`Cut applied! Removed ${removedArea.toFixed(2)} sq ft`)
          } catch (error) {
            toast.error('Failed to apply cut')
            console.error(error)
          }

          setSelectedPolygonForCut(null)
          setActiveTool(null)
        }
      } else {
        // Normal polygon creation
        const { area, perimeter } = calculateAreaAndPerimeter(coordinates)

        const newPolygon: SavedPolygon = {
          id: crypto.randomUUID(),
          paths: coordinates, // Simple array for new polygon
          color: POLYGON_COLORS[selectedColorIndex],
          area,
          perimeter,
          name: `Area #${polygons.length + 1}`,
          notes: ''
        }

        setPolygons(prev => [...prev, newPolygon])
        toast.success(`Polygon added! Area: ${area.squareFeet.toFixed(2)} sq ft`)
      }

      setActiveTool(null)
    },
    [selectedColorIndex, polygons, activeTool, selectedPolygonForCut]
  )

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      if (activeTool === 'polygon' || (activeTool === 'cut' && selectedPolygonForCut)) {
        const lat = e.latLng.lat()
        const lng = e.latLng.lng()

        // If they click very close to the first point, close it natively
        if (draftPolygon.length >= 3) {
          const first = draftPolygon[0]

          // Very simple quick distance check
          const dLat = first.lat - lat
          const dLng = first.lng - lng
          const distSq = dLat * dLat + dLng * dLng

          // small threshold depending on zoom ~ approx a few meters
          if (distSq < 0.00000005) {
            if (isCompletingPolygon.current) return
            isCompletingPolygon.current = true
            handlePolygonComplete(draftPolygon)
            setDraftPolygon([])
            setMousePosition(null)
            setTimeout(() => {
              isCompletingPolygon.current = false
            }, 100)

            return
          }
        }

        setDraftPolygon(prev => [...prev, { lat, lng }])
      }
    },
    [activeTool, selectedPolygonForCut, draftPolygon, handlePolygonComplete]
  )

  const onMapMouseMove = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return

      if ((activeTool === 'polygon' || activeTool === 'cut') && draftPolygon.length > 0) {
        setMousePosition({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      }
    },
    [activeTool, draftPolygon.length]
  )

  // Delete polygon
  const deletePolygon = (id: string) => {
    setPolygons(prev => prev.filter(p => p.id !== id))
    toast.success('Polygon deleted')
  }

  // Clear all polygons
  const clearAllPolygons = () => {
    setPolygons([])
    toast.success('All polygons cleared')
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Screen shoot of the map
  const takeScreenshot = async () => {
    // Target the DIV container, not the map instance
    if (!mapContainerRef.current) return

    try {
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true, // Crucial for Google Maps tiles
        allowTaint: true,
        backgroundColor: null
      })

      const link = document.createElement('a')

      link.href = canvas.toDataURL('image/png')
      link.download = `takeoff-${Date.now()}.png`
      link.click()
      toast.success('Screenshot downloaded')
    } catch (error) {
      console.error('Screenshot error:', error)
      toast.error('Failed to take screenshot. Note: Maps sometimes block programmatic screenshots.')
    }
  }

  // Search location
  const searchLocation = () => {
    if (!searchInputRef.current || !isLoaded) return
    const searchAddress = searchInputRef.current.value

    if (!searchAddress) return

    const geocoder = new google.maps.Geocoder()

    geocoder.geocode({ address: searchAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location

        const coordinates = {
          lat: location.lat(),
          lng: location.lng()
        }

        setMapCenter(coordinates)
        setMarkerPosition(coordinates)
        toast.success('Location found')
      } else {
        toast.error('Location not found')
      }
    })
  }

  // Save to database (placeholder)
  const savePolygons = async () => {
    if (polygons.length === 0) {
      toast.error('Please draw at least one polygon')

      return
    }

    const takeoffData: TakeoffData = {
      address: address || '',
      center: mapCenter,
      zoom: mapZoom,
      polygons,
      totalArea
    }

    setIsSaving(true)

    try {
      const response = await EstimateService.updateTakeOffData(estimate.id, takeoffData)

      setIsSaving(false)
      setIsFullscreen(false)
      toast.success(response.message || 'Take-off data saved successfully')
    } catch (error) {
      setIsSaving(false)
      toast.error('Failed to save take-off data')
    }
  }

  // Update the GoogleMap component to listen to zoom changes
  const onZoomChanged = useCallback(() => {
    if (mapRef.current) {
      setMapZoom(mapRef.current.getZoom() || 18)
    }
  }, [])

  // Update initial loading to use saved zoom if available
  useEffect(() => {
    if (estimate?.take_off_data?.zoom) {
      setMapZoom(estimate.take_off_data.zoom)
    }

    if (estimate?.take_off_data?.center) {
      setMapCenter(estimate.take_off_data.center)
    }
  }, [estimate?.take_off_data])

  useEffect(() => {
    if (!isLoaded || !window.google || !window.google.maps.places || !autocompleteContainerRef.current) return

    autocompleteContainerRef.current.innerHTML = ''

    try {
      // PlaceAutocompleteElement is the modern non-deprecated way
      const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({})

      // Styling the web component internally if needed, or rely on external CSS
      autocompleteElement.style.width = '100%'
      autocompleteElement.style.height = '100%'

      // @ts-ignore - The gmp-placeselect event might not be typed in standard Google Maps types
      autocompleteElement.addEventListener('gmp-placeselect', async (e: any) => {
        const place = e.place

        if (!place) return

        await place.fetchFields({ fields: ['location', 'formattedAddress'] })

        if (place.location) {
          const coordinates = {
            lat: place.location.lat(),
            lng: place.location.lng()
          }

          setMapCenter(coordinates)
          setMarkerPosition(coordinates)

          if (searchInputRef.current) {
            searchInputRef.current.value = place.formattedAddress || ''
          }

          toast.success('Location found')
        }
      })

      autocompleteContainerRef.current.appendChild(autocompleteElement)
    } catch (err) {
      console.error('Failed to initialize PlaceAutocompleteElement', err)
    }
  }, [isLoaded, mapCenter])

  if (!address) {
    return null
  }

  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}`}>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-white text-base'>Location & Take-off</CardTitle>
          <p className='text-xs text-zinc-400'>{address}</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={toggleFullscreen} size='sm' variant='ghost' className='text-xs px-2 py-1'>
            {isFullscreen ? <Minimize2 className='size-4' /> : <Maximize2 className='size-4' />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className={isFullscreen ? 'flex-1 overflow-y-auto' : ''}>
        {!isLoaded || isLoadingLocation ? (
          <div className='relative flex items-center justify-center h-[400px] bg-zinc-800 rounded-md'>
            <SpinnerCustom />
          </div>
        ) : (
          <div className={`flex flex-col lg:flex-row gap-4`} style={{ height: isFullscreen ? 'auto' : '400px' }}>
            {/* Map Container Wrapper for Screenshot */}
            <div
              ref={mapContainerRef}
              className={`${isFullscreen ? 'w-full h-[calc(100vh-200px)]' : 'flex-1'} relative rounded-md overflow-hidden`}
            >
              <GoogleMap
                onLoad={onMapLoad}
                onUnmount={onMapUnmount}
                onZoomChanged={onZoomChanged}
                onClick={onMapClick}
                onMouseMove={onMapMouseMove}
                mapContainerStyle={{
                  width: '100%',
                  height: '100%'
                }}
                center={mapCenter}
                zoom={mapZoom}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: false,
                  styles: NIGHT_MODE_STYLES,
                  mapTypeId: 'hybrid',
                  draggableCursor: activeTool === 'hand' ? 'grab' : 'default',
                  gestureHandling: mapDraggable ? 'auto' : 'none'
                }}
              >
                <OverlayViewF
                  position={markerPosition}
                  mapPaneName={'overlayMouseTarget'}
                  getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -height })}
                >
                  <div
                    className='flex items-center justify-center'
                    style={{ width: 32, height: 32, transform: 'translate(0, 16px)' }}
                  >
                    <svg viewBox='0 0 24 36' fill='#ea4335' width='28' height='42' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M12 0C5.372 0 0 5.373 0 12c0 8.5 12 24 12 24s12-15.5 12-24c0-6.627-5.372-12-12-12zm0 17c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5z' />
                    </svg>
                  </div>
                </OverlayViewF>

                {draftPolygon.length > 0 && (
                  <>
                    <Polygon
                      paths={mousePosition ? [...draftPolygon, mousePosition] : draftPolygon}
                      options={{
                        fillColor: activeTool === 'cut' ? '#ef4444' : POLYGON_COLORS[selectedColorIndex].fill,
                        fillOpacity: 0.2,
                        strokeWeight: 0,
                        clickable: false
                      }}
                    />
                    <Polyline
                      path={mousePosition ? [...draftPolygon, mousePosition] : draftPolygon}
                      options={{
                        strokeColor: activeTool === 'cut' ? '#dc2626' : POLYGON_COLORS[selectedColorIndex].stroke,
                        strokeOpacity: 1,
                        strokeWeight: activeTool === 'cut' ? 2 : 4,
                        clickable: false
                      }}
                    />
                  </>
                )}

                {polygons.map(polygon => (
                  <Polygon
                    key={polygon.id}
                    paths={polygon.paths}
                    options={{
                      fillColor: polygon.color.fill,
                      fillOpacity: hoveredPolygonId === polygon.id ? 0.6 : 0.3,
                      strokeWeight: hoveredPolygonId === polygon.id ? 3 : 2,
                      strokeColor: polygon.color.stroke,
                      editable: false,
                      draggable: false,
                      clickable: false
                    }}
                  />
                ))}
              </GoogleMap>

              {/* Left Toolbar - Added data-html2canvas-ignore to prevent toolbar from appearing in screenshot if desired */}
              {isFullscreen && (
                <div
                  data-html2canvas-ignore='true'
                  className='absolute top-30 lg:top-16 left-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 lg:space-y-2 flex flex-row lg:flex-col gap-2'
                >
                  {/* Drawing Tools */}
                  <DrawingTools
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    setSelectedPolygonForCut={setSelectedPolygonForCut}
                    setMapDraggable={setMapDraggable}
                    selectedColorIndex={selectedColorIndex}
                    selectedPolygonForCut={selectedPolygonForCut}
                  />

                  {/* Divider */}
                  <Separator orientation='horizontal' className='w-full hidden lg:block' />
                  <Separator orientation='vertical' className='h-10 lg:hidden' />

                  {/* Screenshot & Search */}
                  <div className='lg:space-y-1 flex flex-row lg:flex-col gap-2'>
                    <button
                      onClick={takeScreenshot}
                      className='w-10 h-10 flex items-center justify-center rounded border bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-all'
                      title='Take Screenshot'
                    >
                      <Camera className='w-5 h-5 text-white' />
                    </button>

                    <button
                      onClick={() => searchInputRef.current?.focus()}
                      className='w-10 h-10 flex items-center justify-center rounded border bg-zinc-800 border-zinc-700 hover:bg-zinc-700 transition-all'
                      title='Search Location'
                    >
                      <Search className='w-5 h-5 text-white' />
                    </button>
                  </div>
                </div>
              )}

              {/* Search Input */}
              {isFullscreen && (
                <div
                  data-html2canvas-ignore='true'
                  className='absolute top-16 lg:top-2.5 left-2 lg:left-48 right-4 flex gap-2 z-10'
                >
                  {isLoaded ? (
                    <div
                      ref={autocompleteContainerRef}
                      className='flex-1 h-10 bg-zinc-800 rounded text-white overflow-hidden'
                    />
                  ) : (
                    <input
                      ref={searchInputRef}
                      type='text'
                      placeholder='Search location...'
                      disabled
                      className='w-full flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 opacity-50'
                    />
                  )}
                  <Button onClick={searchLocation} size='lg' className='px-3 text-ms'>
                    Go
                  </Button>
                </div>
              )}

              {/* Color Selector */}
              {isFullscreen && (
                <div
                  data-html2canvas-ignore='true'
                  className='absolute bottom-8 left-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 space-y-2'
                >
                  <p className='text-xs text-zinc-400 font-medium'>Polygon Color</p>
                  <div className='grid grid-cols-8 lg:grid-cols-4 gap-2'>
                    {POLYGON_COLORS.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColorIndex(index)}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          selectedColorIndex === index ? 'border-white ring-2 ring-white' : 'border-zinc-700'
                        }`}
                        style={{ backgroundColor: color.fill }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Measurements Panel */}
            {isFullscreen && (
              <MeasurementsPanel
                polygons={polygons}
                totalArea={totalArea}
                hoveredPolygonId={hoveredPolygonId}
                selectedPolygonForCut={selectedPolygonForCut}
                setHoveredPolygonId={setHoveredPolygonId}
                setSelectedPolygonForCut={setSelectedPolygonForCut}
                activeTool={activeTool}
                deletePolygon={deletePolygon}
                clearAllPolygons={clearAllPolygons}
                savePolygons={savePolygons}
                isSaving={isSaving}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PerformTakeOfSection
