'use client'

import React, { ReactNode, createContext, useContext } from 'react'
import { useLoadScript } from '@react-google-maps/api'

const GoogleMapsContext = createContext<{ isLoaded: boolean }>({ isLoaded: false })

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}

const libraries: ('places' | 'drawing' | 'geometry')[] = ['places', 'drawing', 'geometry']

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    id: 'google-map-script'
  })

  if (loadError) return <div>Error loading maps</div>

  return <GoogleMapsContext.Provider value={{ isLoaded }}>{children}</GoogleMapsContext.Provider>
}
