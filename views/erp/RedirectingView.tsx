'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

        // Process the redirect data (decrypt and store cookies in a single server action)
        const { processRedirectData } = await import('@/app/actions/auth')
        const result = await processRedirectData(encryptedData)

        if (!result.success || !result.user) {
          setError(result.error || 'Failed to process authentication data')
          setTimeout(() => router.push('/erp/login'), 2000)

          return
        }

        // Dispatch user data to Redux store
        dispatch(setUserData(result.user))

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
