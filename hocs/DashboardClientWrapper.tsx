'use client'

import { ReactNode } from 'react'
import { GoogleMapsProvider } from './GoogleMapProvider'
import { CheckAuthProvider } from './CheckAuthProvider'

export function DashboardClientWrapper({ children }: { children: ReactNode }) {
  return (
    <CheckAuthProvider>
      <GoogleMapsProvider>{children}</GoogleMapsProvider>
    </CheckAuthProvider>
  )
}
