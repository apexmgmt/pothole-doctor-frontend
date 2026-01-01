'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Estimate } from '@/types'
import { useLoadScript, GoogleMap, Marker, DrawingManager, Polygon } from '@react-google-maps/api'
import { useMemo, useState, useEffect, useCallback } from 'react'
import { SpinnerCustom } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Trash2, Maximize2 } from 'lucide-react'

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

const nightModeStyles = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
]

const POLYGON_COLORS = [
  { fill: '#3b82f6', stroke: '#2563eb', name: 'Blue' },
  { fill: '#22c55e', stroke: '#16a34a', name: 'Green' },
  { fill: '#ef4444', stroke: '#dc2626', name: 'Red' },
  { fill: '#f59e0b', stroke: '#d97706', name: 'Orange' },
  { fill: '#8b5cf6', stroke: '#7c3aed', name: 'Purple' },
  { fill: '#ec4899', stroke: '#db2777', name: 'Pink' },
  { fill: '#06b6d4', stroke: '#0891b2', name: 'Cyan' },
  { fill: '#eab308', stroke: '#ca8a04', name: 'Yellow' }
]

interface SavedPolygon {
  id: string
  paths: google.maps.LatLngLiteral[]
  color: (typeof POLYGON_COLORS)[0]
  area: {
    squareFeet: number
    squareMeters: number
  }
}

const PerformTakeOfSection = ({ estimate }: { estimate: Estimate }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [polygons, setPolygons] = useState<SavedPolygon[]>([])
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Get address from estimate
  const address = useMemo(() => {
    const clientAddress = estimate?.location

    if (!clientAddress) return null

    return clientAddress ?? null
  }, [estimate])

  // Calculate total area
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

  // Geocode the address to get coordinates
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

  // Calculate polygon area
  const calculateArea = (paths: google.maps.LatLngLiteral[]) => {
    if (!window.google) return { squareFeet: 0, squareMeters: 0 }

    const areaInSquareMeters = google.maps.geometry.spherical.computeArea(
      paths.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
    )

    const areaInSquareFeet = areaInSquareMeters * 10.7639

    return {
      squareFeet: areaInSquareFeet,
      squareMeters: areaInSquareMeters
    }
  }

  // Handle polygon completion
  const onPolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const paths = polygon.getPath().getArray()

      const coordinates = paths.map(latLng => ({
        lat: latLng.lat(),
        lng: latLng.lng()
      }))

      const area = calculateArea(coordinates)

      const newPolygon: SavedPolygon = {
        id: Date.now().toString(),
        paths: coordinates,
        color: POLYGON_COLORS[selectedColorIndex],
        area
      }

      setPolygons(prev => [...prev, newPolygon])
      polygon.setMap(null)
      setIsDrawingMode(false)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }

      toast.success(`Polygon added! Area: ${area.squareFeet.toFixed(2)} sq ft`)
    },
    [drawingManager, selectedColorIndex]
  )

  // Handle drawing manager load
  const onDrawingManagerLoad = useCallback((manager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(manager)
  }, [])

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode)

    if (drawingManager) {
      drawingManager.setDrawingMode(!isDrawingMode ? google.maps.drawing.OverlayType.POLYGON : null)
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

  // Save all polygons
  const savePolygons = async () => {
    if (polygons.length === 0) {
      toast.error('Please draw at least one polygon')

      return
    }

    // TODO: Integrate with your API to save polygons
    console.log('Saving polygons:', polygons)
    console.log('Total area:', totalArea)

    toast.success(`Saved ${polygons.length} polygon(s)! Total area: ${totalArea.squareFeet.toFixed(2)} sq ft`)
  }

  // Don't render the card if there's no address
  if (!address) {
    return null
  }

  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
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
      <CardContent>
        {!isLoaded || isLoadingLocation ? (
          <div className='relative flex items-center justify-center h-[400px] bg-zinc-800 rounded-md'>
            <SpinnerCustom />
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Map Container */}
            <div className='relative rounded-md overflow-hidden'>
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: isFullscreen ? 'calc(100vh - 300px)' : '400px'
                }}
                center={mapCenter}
                zoom={18}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: false,
                  styles: nightModeStyles,
                  mapTypeId: 'satellite'
                }}
              >
                <Marker position={markerPosition} />

                {/* Drawing Manager */}
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

                {/* Display saved polygons */}
                {polygons.map(polygon => (
                  <Polygon
                    key={polygon.id}
                    paths={polygon.paths}
                    options={{
                      fillColor: polygon.color.fill,
                      fillOpacity: 0.3,
                      strokeWeight: 2,
                      strokeColor: polygon.color.stroke,
                      editable: false,
                      draggable: false
                    }}
                  />
                ))}
              </GoogleMap>

              {/* Drawing Controls Overlay */}
              <div className='absolute top-4 left-4 bg-zinc-900/95 backdrop-blur-sm border border-zinc-800 rounded-lg p-3 space-y-3'>
                <div className='space-y-2'>
                  <p className='text-xs text-zinc-400 font-medium'>Drawing Tools</p>
                  <Button
                    onClick={toggleDrawingMode}
                    size='sm'
                    variant={isDrawingMode ? 'default' : 'outline'}
                    className='w-full text-xs'
                  >
                    {isDrawingMode ? 'Cancel Drawing' : 'Draw Polygon'}
                  </Button>
                </div>

                {/* Color Selector */}
                <div className='space-y-2'>
                  <p className='text-xs text-zinc-400 font-medium'>Polygon Color</p>
                  <div className='grid grid-cols-4 gap-2'>
                    {POLYGON_COLORS.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColorIndex(index)}
                        className={`w-8 h-8 rounded border-2 ${
                          selectedColorIndex === index ? 'border-white' : 'border-zinc-700'
                        }`}
                        style={{ backgroundColor: color.fill }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {polygons.length > 0 && (
                  <div className='space-y-2 pt-2 border-t border-zinc-800'>
                    <Button onClick={clearAllPolygons} size='sm' variant='outline' className='w-full text-xs'>
                      Clear All
                    </Button>
                    <Button onClick={savePolygons} size='sm' variant='default' className='w-full text-xs'>
                      Save Areas ({polygons.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Polygon List */}
            {polygons.length > 0 && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-medium text-zinc-200'>Selected Areas</h3>
                  <div className='text-xs text-zinc-400'>
                    Total: <span className='font-semibold text-white'>{totalArea.squareFeet.toFixed(2)} sq ft</span>
                  </div>
                </div>
                <div className='space-y-2 max-h-40 overflow-y-auto'>
                  {polygons.map((polygon, index) => (
                    <div
                      key={polygon.id}
                      className='flex items-center justify-between bg-zinc-800 rounded-md p-3 border border-zinc-700'
                    >
                      <div className='flex items-center gap-3'>
                        <div
                          className='w-4 h-4 rounded border border-zinc-600'
                          style={{ backgroundColor: polygon.color.fill }}
                        />
                        <div>
                          <p className='text-sm text-zinc-200'>
                            Area {index + 1} - {polygon.color.name}
                          </p>
                          <p className='text-xs text-zinc-400'>
                            {polygon.area.squareFeet.toFixed(2)} sq ft ({polygon.area.squareMeters.toFixed(2)} sq m)
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => deletePolygon(polygon.id)}
                        size='sm'
                        variant='ghost'
                        className='text-red-400 hover:text-red-300 hover:bg-red-950/50'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PerformTakeOfSection
