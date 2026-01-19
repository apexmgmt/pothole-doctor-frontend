'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { decryptData } from '@/utils/encryption'
import CookieService from '@/services/app/cookie.service'
import { encryptData } from '@/utils/encryption'
import { useAppDispatch } from '@/lib/hooks'
import { setUserData } from '@/lib/features/auth/authSlice'

interface RedirectingViewProps {
  encryptedData: string
}

const RedirectingView: React.FC<RedirectingViewProps> = ({ encryptedData }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processRedirect = async () => {
      try {
        if (!encryptedData) {
          setError('No authentication data received')
          setTimeout(() => router.push('/erp/login'), 2000)

          return
        }

        // Decrypt the data
        const authData = decryptData(decodeURIComponent(encryptedData))

        if (!authData || !authData.access_token) {
          setError('Failed to decrypt authentication data')
          setTimeout(() => router.push('/erp/login'), 2000)

          return
        }

        // Store the decrypted data in cookies
        CookieService.storeSync('access_token', authData.access_token, { expires: authData.expires_in })
        CookieService.storeSync('refresh_token', authData.refresh_token)
        CookieService.storeSync('token_type', authData.token_type)
        CookieService.storeSync('user', encryptData(authData.user))
        CookieService.storeSync('roles', encryptData(authData.roles || []))

        // Split permissions into chunks
        const encryptedPermissions = encryptData(authData.permissions || [])
        const chunkSize = Math.ceil(encryptedPermissions.length / 3)

        const chunk1 = encryptedPermissions.slice(0, chunkSize)
        const chunk2 = encryptedPermissions.slice(chunkSize, chunkSize * 2)
        const chunk3 = encryptedPermissions.slice(chunkSize * 2)

        CookieService.storeSync('permissions_1', chunk1)
        CookieService.storeSync('permissions_2', chunk2)
        CookieService.storeSync('permissions_3', chunk3)

        // Dispatch user data to Redux store
        dispatch(setUserData(authData.user))

        // Redirect to ERP dashboard
        router.push('/erp/')
      } catch (err) {
        console.error('Redirect error:', err)
        setError('Authentication failed. Please try logging in again.')
        setTimeout(() => router.push('/erp/login'), 2000)
      }
    }

    processRedirect()
  }, [encryptedData, router, dispatch])

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h1 className='text-2xl font-semibold text-red-500 mb-4'>Error</h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          <button
            onClick={() => router.push('/erp/login')}
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
        <h1 className='text-2xl font-semibold text-gray-700 mb-2'>Redirecting...</h1>
        <p className='text-gray-500'>Please wait while we set up your session.</p>
      </div>
    </div>
  )
}

export default RedirectingView
