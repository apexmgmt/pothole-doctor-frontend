'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { User } from '@/types'
import AuthService from '@/services/api/auth.service'
import CookieService from '@/services/app/cookie.service'
import { encryptData } from '@/utils/encryption'

interface SidebarDataContextValue {
  user: User | null
  permissions: string[]
}

const SidebarDataContext = createContext<SidebarDataContextValue>({
  user: null,
  permissions: []
})

interface SidebarDataProviderProps {
  initialUser: User | null
  initialPermissions: string[]
  children: React.ReactNode
}

/**
 * SidebarDataProvider
 *
 * Accepts the server-side resolved user/permissions as initial values.
 * When permissions are empty (e.g. cookies were missing at SSR time but the
 * access token is still valid), it performs a client-side fetch from the API
 * and re-hydrates both the state and the cookies so subsequent navigations
 * work correctly — all without converting layout.tsx into a Client Component.
 */
export const SidebarDataProvider = ({ initialUser, initialPermissions, children }: SidebarDataProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser)
  const [permissions, setPermissions] = useState<string[]>(initialPermissions)

  useEffect(() => {
    // Only refetch when the server failed to supply permissions/user.
    // If the server already populated them there is nothing to do.
    if (initialPermissions.length > 0 && initialUser) return

    const refetch = async () => {
      try {
        const accessToken = CookieService.get('access_token')

        if (!accessToken) return

        const response = await AuthService.getAuthDetails()
        const data = response?.data

        if (!data) return

        // Update local state so the sidebar re-renders immediately.
        setUser(data.user ?? null)
        setPermissions(data.permissions ?? [])

        // Re-write cookies so the next full-page navigation finds them.
        await CookieService.store('user', encryptData(data.user))
        await CookieService.store('roles', encryptData(data.roles || []))

        const encryptedPermissions = encryptData(data.permissions || [])
        const chunkSize = Math.ceil(encryptedPermissions.length / 3)

        await CookieService.store('permissions_1', encryptedPermissions.slice(0, chunkSize))
        await CookieService.store('permissions_2', encryptedPermissions.slice(chunkSize, chunkSize * 2))
        await CookieService.store('permissions_3', encryptedPermissions.slice(chunkSize * 2))
      } catch {
        // Silently ignore — the sidebar will simply show no items.
      }
    }

    refetch()
  }, []) // intentionally empty — runs once on mount to recover from missing SSR cookies

  return <SidebarDataContext.Provider value={{ user, permissions }}>{children}</SidebarDataContext.Provider>
}

export const useSidebarData = () => useContext(SidebarDataContext)
