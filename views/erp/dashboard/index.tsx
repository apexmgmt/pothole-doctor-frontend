'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import AuthService from '@/services/api/auth.service'
import { appUrl } from '@/utils/utility'
import { generateRedirectUrl } from '@/app/actions/auth'

import MainAppDashboard from './components/MainAppDashboard'
import TenantDashboardView from './components/TenantDashboardView'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

const DashboardIndex = ({
  initialData,
  initialTenantMode,
  error
}: {
  initialData: Record<string, unknown> | null
  initialTenantMode: boolean
  error: string | null
}) => {
  const [tenantMode] = useState<boolean>(initialTenantMode)
  const [data] = useState<Record<string, unknown> | null>(initialData)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPageTitle('Dashboard'))
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

      const baseUrl = appUrl(response.data.domain ?? '')
      const redirectUrl = await generateRedirectUrl(authData, response.data.domain ?? '')

      const newWindow = window.open(redirectUrl, '_blank')

      if (!newWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site.')
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to impersonate user')
    }
  }, [])

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
