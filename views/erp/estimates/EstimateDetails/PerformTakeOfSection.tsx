'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Estimate } from '@/types'
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import { useMemo, useState, useEffect } from 'react'
import { SpinnerCustom } from '@/components/ui/spinner'

const libraries: 'places'[] = ['places']

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
}

// Define your custom styles array outside the component to prevent re-creation on every render
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

const PerformTakeOfSection = ({ estimate }: { estimate: Estimate }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPosition, setMarkerPosition] = useState(defaultCenter)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  // Get address from estimate
  const address = useMemo(() => {
    const clientAddress = estimate?.location

    if (!clientAddress) return null

    return clientAddress ?? null
  }, [estimate])

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

  // Don't render the card if there's no address
  if (!address) {
    return null
  }

  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-white text-base'>Location</CardTitle>
          <p className='text-xs text-zinc-400'>{address}</p>
        </div>
        <Button size='sm' variant='outline' className='text-xs px-3 py-1'>
          Perform take-off
        </Button>
      </CardHeader>
      <CardContent>
        {!isLoaded || isLoadingLocation ? (
          <div className='relative flex items-center justify-center h-[400px] bg-zinc-800 rounded-md'>
            <SpinnerCustom />
          </div>
        ) : (
          <div className='rounded-md overflow-hidden'>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={15}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                styles: nightModeStyles
              }}
            >
              <Marker position={markerPosition} />
            </GoogleMap>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PerformTakeOfSection
