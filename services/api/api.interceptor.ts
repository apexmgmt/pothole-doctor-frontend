'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { CookieKeys } from '@/constants/cookies'
import { setAuthCookies } from '@/app/actions/auth'

interface ApiInterceptorOptions extends RequestInit {
  requiresAuth?: boolean
  req?: any
  res?: any
  serverCookies?: Record<string, string>
  _isRetry?: boolean // internal flag to prevent infinite loops
}

const clearAuthAndRedirect = async () => {
  try {
    const cookieStore = await cookies()

    cookieStore.delete(CookieKeys.ACCESS_TOKEN)
    cookieStore.delete(CookieKeys.REFRESH_TOKEN)
    cookieStore.delete(CookieKeys.TOKEN_TYPE)
    cookieStore.delete(CookieKeys.PERMISSIONS_1)
    cookieStore.delete(CookieKeys.PERMISSIONS_2)
    cookieStore.delete(CookieKeys.PERMISSIONS_3)
    cookieStore.delete(CookieKeys.ROLES)
    cookieStore.delete(CookieKeys.USER)
  } catch {
    // Ignore error if we are in a Server Component render context
  }

  redirect('/erp/login')
}

let isRefreshing = false
let refreshPromise: Promise<any> | null = null

const apiInterceptor = async (url: string, options: ApiInterceptorOptions = {}): Promise<Response> => {
  const { requiresAuth = true, req, serverCookies, _isRetry = false, ...fetchOptions } = options

  const cookieStore = await cookies()
  let accessToken = cookieStore.get(CookieKeys.ACCESS_TOKEN)?.value
  let refreshToken = cookieStore.get(CookieKeys.REFRESH_TOKEN)?.value
  let tenant = cookieStore.get(CookieKeys.TENANT)?.value

  if (!tenant) {
    const { getTenantSubdomain } = await import('@/utils/utility')

    tenant = (await getTenantSubdomain()) || undefined
  }

  // If auth required and access token missing but refresh token exists => try refresh first
  if (requiresAuth && !accessToken && refreshToken && !_isRetry) {
    if (isRefreshing && refreshPromise) {
      try {
        await refreshPromise
        accessToken = cookieStore.get(CookieKeys.ACCESS_TOKEN)?.value
      } catch (error) {
        await clearAuthAndRedirect()
        throw new Error('Failed to refresh token', { cause: error })
      }
    } else {
      isRefreshing = true

      // Import AuthService dynamically
      const { default: AuthService } = await import('@/services/api/auth.service')

      refreshPromise = AuthService.refreshToken(refreshToken)
        .then(async refreshed => {
          const payload = refreshed?.data || refreshed

          if (payload && payload.access_token) {
            await setAuthCookies(payload.access_token, payload.refresh_token, payload.token_type, payload.expires_in)
            isRefreshing = false
            refreshPromise = null

            return payload
          } else {
            isRefreshing = false
            refreshPromise = null
            throw new Error('No access token in refresh response')
          }
        })
        .catch(async error => {
          isRefreshing = false
          refreshPromise = null
          console.log('[INTERCEPTOR] Refresh token failed. Response:', error)
          await clearAuthAndRedirect()
          throw new Error('Failed to refresh token', { cause: error })
        })

      try {
        const refreshed = await refreshPromise

        accessToken = refreshed?.access_token
        refreshToken = refreshed?.refresh_token
      } catch (error) {
        throw new Error('Failed to refresh token', { cause: error })
      }
    }
  }

  // If auth required and still no access token => clear and redirect
  if (requiresAuth && !accessToken) {
    await clearAuthAndRedirect()
    throw new Error('Authentication failed. Please log in again.')
  }

  // Prepare headers
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {})
  }

  if (requiresAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  if (tenant) {
    headers['tenant'] = tenant
  }

  if (fetchOptions.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    let response = await fetch(url, { ...fetchOptions, headers })

    // If 401 and requiresAuth and not already a retry -> attempt refresh once
    if (response.status === 401 && requiresAuth && !_isRetry) {
      refreshToken = cookieStore.get(CookieKeys.REFRESH_TOKEN)?.value

      if (refreshToken) {
        if (isRefreshing && refreshPromise) {
          try {
            await refreshPromise
            const newAccessToken = cookieStore.get(CookieKeys.ACCESS_TOKEN)?.value

            if (newAccessToken) {
              const retryHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` }

              response = await fetch(url, { ...fetchOptions, headers: retryHeaders })
              if (response.status !== 401) return response
            }
          } catch {
            // Fall through
          }
        } else {
          isRefreshing = true
          const { default: AuthService } = await import('@/services/api/auth.service')

          refreshPromise = AuthService.refreshToken(refreshToken)
            .then(async refreshed => {
              const payload = refreshed?.data || refreshed

              if (payload && payload.access_token) {
                await setAuthCookies(
                  payload.access_token,
                  payload.refresh_token,
                  payload.token_type,
                  payload.expires_in
                )
                isRefreshing = false
                refreshPromise = null

                return payload
              } else {
                isRefreshing = false
                refreshPromise = null
                throw new Error('No access token in refresh response')
              }
            })
            .catch(async error => {
              isRefreshing = false
              refreshPromise = null
              console.log('[INTERCEPTOR] Refresh token failed. Response:', error)
              await clearAuthAndRedirect()
              throw new Error('Failed to refresh token', { cause: error })
            })

          try {
            const refreshed = await refreshPromise
            const retryHeaders = { ...headers, Authorization: `Bearer ${refreshed?.access_token}` }

            response = await fetch(url, { ...fetchOptions, headers: retryHeaders })
            if (response.status !== 401) return response
          } catch {
            // Fall through
          }
        }
      }

      await clearAuthAndRedirect()
      throw new Error('Authentication failed. Please log in again.')
    }

    return response
  } catch (error) {
    throw error
  }
}

export default apiInterceptor
