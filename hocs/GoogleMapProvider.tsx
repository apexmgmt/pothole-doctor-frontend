'use client'

import React, { ReactNode } from 'react'
import { useLoadScript } from '@react-google-maps/api'

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    id: 'google-map-script'
  })

  if (loadError) return <div>Error loading maps</div>

  // We return the children. If you want to show a spinner
  // until the script is ready, you can do that here.
  return <>{children}</>
}
