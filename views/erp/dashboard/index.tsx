'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import AuthService from '@/services/api/auth.service'
import DashboardService from '@/services/api/dashboard.service'
import { encryptData } from '@/utils/encryption'
import { appUrl, isTenant } from '@/utils/utility'

import MainAppDashboard from './components/MainAppDashboard'
import TenantDashboardView from './components/TenantDashboardView'
import { LoadingSkeleton } from './components/shared'

const DashboardIndex = () => {
  const [tenantMode, setTenantMode] = useState<boolean | null>(null)
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Determine tenant context and fetch dashboard data in parallel
    isTenant().then(t => setTenantMode(t))

    DashboardService.get()
      .then(res => setData(res?.data ?? res))
      .catch(err => {
        const msg = String(err?.message ?? '')

        // Auth errors are handled globally by the interceptor (redirect to login)
        if (!msg.toLowerCase().includes('authentication')) {
          setError(msg || 'Failed to load dashboard')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const impersonateUser = useCallback(async (userId: string) => {
    try {
      const response = await AuthService.impersonate(userId)

      const authData = {
        access_token: response?.data.access_token,
        refresh_token: response?.data.refresh_token,
        token_type: response?.data.token_type,
        expires_in: response?.data.expires_in,
        user: response?.data?.user,
        roles: response?.data?.roles ?? [],
        permissions: response?.data?.permissions ?? []
      }

      const encryptedData = encryptData(authData)
      const baseUrl = appUrl(response.data.domain ?? '')
      const redirectUrl = `${baseUrl}/erp/redirecting?data=${encodeURIComponent(encryptedData)}`

      const newWindow = window.open(redirectUrl, '_blank')

      if (!newWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site.')
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to impersonate user')
    }
  }, [])

  if (loading || tenantMode === null) return <LoadingSkeleton />

  if (error) {
    return (
      <div className='p-6'>
        <div className='rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-destructive text-sm'>
          {error}
        </div>
      </div>
    )
  }

  if (tenantMode) return <TenantDashboardView data={data} />

  return <MainAppDashboard data={data} impersonateUser={impersonateUser} />
}

export default DashboardIndex
