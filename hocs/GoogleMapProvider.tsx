'use client'

import { ReactNode, createContext, useContext } from 'react'
import { Libraries, useLoadScript } from '@react-google-maps/api'

type GoogleMapsContextType = {
  isLoaded: boolean
  loadError?: Error
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({ isLoaded: false })

export function useGoogleMaps() {
  return useContext(GoogleMapsContext)
}

const libraries: Libraries = ['places', 'drawing', 'geometry', 'marker']

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    id: 'google-map-script'
  })

  if (loadError) return <div>Error loading maps</div>

  return <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>{children}</GoogleMapsContext.Provider>
}
