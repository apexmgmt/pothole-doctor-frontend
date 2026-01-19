'use client'

import { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { setRefreshData, setUserData } from '@/lib/features/auth/authSlice'
import AuthService from '@/services/api/auth.service'
import { RootState } from '@/lib/store'
import CookieService from '@/services/app/cookie.service'
import { encryptData } from '@/utils/encryption'

interface CheckAuthProviderProps {
  children: React.ReactNode
}

export const CheckAuthProvider = ({ children }: CheckAuthProviderProps) => {
  const dispatch = useDispatch()
  const refresh = useSelector((state: RootState) => state.auth.refresh)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    const fetchAuthDetails = async () => {
      if (!refresh) return

      // On initial load, wait for proxy middleware to complete
      if (isInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsInitialLoad(false)
      }

      try {
        // Check if access token exists before making API call
        const accessToken = CookieService.get('access_token')

        if (!accessToken) {
          dispatch(setRefreshData(false))

          return
        }

        const response = await AuthService.getAuthDetails()

        dispatch(setUserData(response.data?.user))
        await CookieService.store('user', encryptData(response?.data?.user))
        await CookieService.store('roles', encryptData(response?.data?.roles || []))

        // Split permissions into chunks to avoid cookie size limit
        const encryptedPermissions = encryptData(response?.data?.permissions || [])
        const chunkSize = Math.ceil(encryptedPermissions.length / 3)

        const chunk1 = encryptedPermissions.slice(0, chunkSize)
        const chunk2 = encryptedPermissions.slice(chunkSize, chunkSize * 2)
        const chunk3 = encryptedPermissions.slice(chunkSize * 2)

        await CookieService.store('permissions_1', chunk1)
        await CookieService.store('permissions_2', chunk2)
        await CookieService.store('permissions_3', chunk3)

        dispatch(setRefreshData(false))
      } catch (error) {
        dispatch(setRefreshData(false))
      }
    }

    fetchAuthDetails()
  }, [refresh, isInitialLoad, dispatch])

  return <>{children}</>
}
