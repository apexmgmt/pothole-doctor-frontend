'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Estimate, SavedPolygon, TakeoffData } from '@/types'
import { useLoadScript, GoogleMap, Marker, DrawingManager, Polygon } from '@react-google-maps/api'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { SpinnerCustom } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Trash2, Maximize2, Download, Hand, Search, Scissors, Camera, Pencil } from 'lucide-react'
import html2canvas from 'html2canvas'
import * as turf from '@turf/turf' // IMPORT TURF
import { NIGHT_MODE_STYLES, POLYGON_COLORS } from '@/constants/take-off-data'
import EstimateService from '@/services/api/estimates/estimates.service'
import { MeasurementsPanel } from './MeasurementsPanel'

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

const PerformTakeOfSection = ({ estimate }: { estimate: Estimate }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const mapRef = useRef<google.maps.Map | null>(null)

  // New ref for the container div to capture screenshot
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [activeTool, setActiveTool] = useState<'polygon' | 'cut' | 'hand' | null>(null)
  const [polygons, setPolygons] = useState<SavedPolygon[]>(estimate?.take_off_data?.polygons || [])
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hoveredPolygonId, setHoveredPolygonId] = useState<string | null>(null)
  const [mapDraggable, setMapDraggable] = useState(true)
  const [selectedPolygonForCut, setSelectedPolygonForCut] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Update the TakeoffData interface usage and add zoom state
  const [mapZoom, setMapZoom] = useState(18)

  const address = useMemo(() => {
    return estimate?.location || null
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

  // Handle polygon completion
  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      // Get the path drawn by the user
      const paths = polygon.getPath().getArray()

      const coordinates = paths.map(latLng => ({
        lat: latLng.lat(),
        lng: latLng.lng()
      }))

      // If cut tool is active and a polygon is selected
      if (activeTool === 'cut' && selectedPolygonForCut) {
        const targetPolygon = polygons.find(p => p.id === selectedPolygonForCut)

        if (targetPolygon) {
          try {
            // Perform subtraction
            const resultPaths = subtractPolygon(targetPolygon.paths, coordinates)

            if (!resultPaths) {
              // Subtraction failed or removed everything
              polygon.setMap(null)

              return
            }

            const { area, perimeter } = calculateAreaAndPerimeter(resultPaths)

            setPolygons(prev =>
              prev.map(p =>
                p.id === selectedPolygonForCut
                  ? {
                      ...p,
                      paths: resultPaths, // Now supports holes
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
          polygon.setMap(null)

          if (drawingManager) {
            drawingManager.setDrawingMode(null)
          }
        }
      } else {
        // Normal polygon creation
        const { area, perimeter } = calculateAreaAndPerimeter(coordinates)

        const newPolygon: SavedPolygon = {
          id: Date.now().toString(),
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

      polygon.setMap(null)
      setActiveTool(null)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }
    },
    [drawingManager, selectedColorIndex, polygons, activeTool, selectedPolygonForCut]
  )

  const onDrawingManagerLoad = useCallback((manager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(manager)
  }, [])

  // Toggle tools
  const toggleTool = (tool: 'polygon' | 'cut' | 'hand') => {
    if (activeTool === tool) {
      setActiveTool(null)
      setSelectedPolygonForCut(null)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }

      setMapDraggable(true)

      return
    }

    setActiveTool(tool)

    if (tool === 'polygon') {
      if (drawingManager) {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
        drawingManager.setOptions({
          polygonOptions: {
            fillColor: POLYGON_COLORS[selectedColorIndex].fill,
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: POLYGON_COLORS[selectedColorIndex].stroke,
            editable: false,
            draggable: false
          }
        })
      }

      setMapDraggable(false)
    } else if (tool === 'hand') {
      setMapDraggable(true)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }

      setSelectedPolygonForCut(null)
    } else if (tool === 'cut') {
      toast.info('Select a polygon from the right panel, then draw the cut area')
      setMapDraggable(false)
    }
  }

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
            <Maximize2 className='w-4 h-4' />
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
                  mapTypeId: 'satellite',
                  draggableCursor: activeTool === 'hand' ? 'grab' : 'default',
                  gestureHandling: mapDraggable ? 'auto' : 'none'
                }}
              >
                <Marker position={markerPosition} />

                <DrawingManager
                  onLoad={onDrawingManagerLoad}
                  onPolygonComplete={onPolygonComplete}
                  options={{
                    drawingControl: false,
                    polygonOptions: {
                      fillColor: POLYGON_COLORS[selectedColorIndex].fill,
                      fillOpacity: 0.3,
                      strokeWeight: 2,
                      strokeColor: POLYGON_COLORS[selectedColorIndex].stroke,
                      editable: false,
                      draggable: false
                    }
                  }}
                />

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
                      draggable: false
                    }}
                  />
                ))}
              </GoogleMap>

              {/* Left Toolbar - Added data-html2canvas-ignore to prevent toolbar from appearing in screenshot if desired */}
              {isFullscreen && (
                <div
                  data-html2canvas-ignore='true'
                  className='absolute top-16 left-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 space-y-2 flex flex-col'
                >
                  {/* Drawing Tools */}
                  <div className='space-y-1'>
                    <button
                      onClick={() => toggleTool('polygon')}
                      className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
                        activeTool === 'polygon'
                          ? 'bg-blue-600 border-blue-500'
                          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title='Draw Polygon'
                    >
                      <Pencil className='w-5 h-5 text-white' />
                    </button>

                    <button
                      onClick={() => toggleTool('cut')}
                      className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
                        activeTool === 'cut'
                          ? 'bg-red-600 border-red-500'
                          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title={selectedPolygonForCut ? 'Draw cut area on map' : 'Select a polygon first, then click cut'}
                    >
                      <Scissors className='w-5 h-5 text-white' />
                    </button>

                    <button
                      onClick={() => toggleTool('hand')}
                      className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
                        activeTool === 'hand'
                          ? 'bg-green-600 border-green-500'
                          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
                      }`}
                      title='Hand Tool (Pan)'
                    >
                      <Hand className='w-5 h-5 text-white' />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className='border-t border-zinc-700' />

                  {/* Screenshot & Search */}
                  <div className='space-y-1'>
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
                <div data-html2canvas-ignore='true' className='absolute top-3 left-48 right-4 flex gap-2'>
                  <input
                    ref={searchInputRef}
                    type='text'
                    placeholder='Search location...'
                    onKeyPress={e => e.key === 'Enter' && searchLocation()}
                    className='flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
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
                  <div className='grid grid-cols-4 gap-2'>
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
                drawingManager={drawingManager}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PerformTakeOfSection
