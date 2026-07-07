'use client'

import { ReactNode } from 'react'
import { GoogleMapsProvider } from './GoogleMapProvider'

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return <GoogleMapsProvider>{children}</GoogleMapsProvider>
}
