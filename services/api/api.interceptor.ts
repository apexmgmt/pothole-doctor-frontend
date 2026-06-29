import CookieService from '@/services/app/cookie.service'

interface ApiInterceptorOptions extends RequestInit {
  requiresAuth?: boolean
  req?: any
  res?: any
  serverCookies?: Record<string, string>
  _isRetry?: boolean // internal flag to prevent infinite loops
}

/**
 * API interceptor that ensures Authorization header has a valid access_token.
 * If access_token is missing and refresh_token exists, it will attempt to refresh the token
 * and store the returned tokens (access_token, refresh_token, token_type, expires_in).
 * On failure to obtain a token the interceptor clears cookies and redirects to login.
 */
const storeTokens = (data: any) => {
  if (!data) return

  const isClient = typeof window !== 'undefined'

  // console.log('[DEBUG] storeTokens called with data:', data)

  // keep same storage strategy as login
  if (data.access_token) {
    const options = { expires: data.expires_in, path: '/' }

    if (isClient) {
      CookieService.storeSync('access_token', data.access_token, options)
    } else {
      CookieService.store('access_token', data.access_token, options)
    }
  }

  if (data.refresh_token) {
    const options = { expires: Number(process.env.NEXT_PUBLIC_REFRESH_TOKEN_DURATION ?? 120), path: '/' }

    // console.log('[DEBUG] Storing NEW refresh_token:', data.refresh_token.substring(0, 10) + '...')

    if (isClient) {
      CookieService.storeSync('refresh_token', data.refresh_token, options)
    } else {
      CookieService.store('refresh_token', data.refresh_token, options)
    }
  } else {
    // console.log('[DEBUG] NO refresh_token found in payload. Keeping old one.')
  }

  if (data.token_type) {
    const options = { path: '/' }

    if (isClient) {
      CookieService.storeSync('token_type', data.token_type, options)
    } else {
      CookieService.store('token_type', data.token_type, options)
    }
  }
}

const clearAuthAndRedirect = async () => {
  await CookieService.delete('access_token')
  await CookieService.delete('refresh_token')
  await CookieService.delete('token_type')
  await CookieService.delete('permissions_1')
  await CookieService.delete('permissions_2')
  await CookieService.delete('permissions_3')
  await CookieService.delete('roles')
  await CookieService.delete('user')

  // Client-side redirect only (interceptor runs client-side)
  if (typeof window !== 'undefined') {
    window.location.href = '/erp/login'
  }
}

let isRefreshing = false
let refreshPromise: Promise<any> | null = null

const apiInterceptor = async (url: string, options: ApiInterceptorOptions = {}): Promise<Response> => {
  const { requiresAuth = true, req, serverCookies, _isRetry = false, ...fetchOptions } = options

  // Read tokens
  let accessToken = await CookieService.get('access_token')
  let refreshToken = await CookieService.get('refresh_token')
  let tenant = await CookieService.get('tenant')

  // If auth required and access token missing but refresh token exists => try refresh first
  if (requiresAuth && !accessToken && refreshToken && !_isRetry) {
    if (isRefreshing) {
      // Wait for ongoing refresh
      try {
        const refreshed = await refreshPromise

        accessToken = refreshed?.access_token
      } catch (err) {
        clearAuthAndRedirect()
        throw new Error('Unable to refresh token')
      }
    } else {
      isRefreshing = true

      // Assign refreshPromise synchronously so parallel requests wait on it
      refreshPromise = (async () => {
        // Import AuthService dynamically to avoid circular dependency
        const { default: AuthService } = await import('@/services/api/auth.service')
        const refreshed = await AuthService.refreshToken()
        const payload = refreshed?.data || refreshed

        if (payload && payload.access_token) {
          storeTokens(payload)

          return payload
        } else {
          throw new Error('No access token in refresh response')
        }
      })()
        .then(payload => {
          isRefreshing = false
          refreshPromise = null

          return payload
        })
        .catch(err => {
          isRefreshing = false
          refreshPromise = null
          clearAuthAndRedirect()
          throw err
        })

      try {
        const refreshed = await refreshPromise

        accessToken = refreshed.access_token
        refreshToken = refreshed.refresh_token
      } catch (err) {
        throw new Error('Unable to refresh token')
      }
    }
  }

  // If auth required and still no access token => clear and redirect
  if (requiresAuth && !accessToken) {
    clearAuthAndRedirect()
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

  // If sending FormData remove Content-Type to let browser set boundary
  if (fetchOptions.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    let response = await fetch(url, { ...fetchOptions, headers })

    // If 401 and requiresAuth and not already a retry -> attempt refresh once
    if (response.status === 401 && requiresAuth && !_isRetry) {
      refreshToken = await CookieService.get('refresh_token')

      if (refreshToken) {
        if (isRefreshing) {
          // Wait for ongoing refresh
          try {
            const refreshed = await refreshPromise
            const newAccessToken = refreshed?.access_token

            if (newAccessToken) {
              const retryHeaders = { ...headers, Authorization: `Bearer ${newAccessToken}` }

              response = await fetch(url, { ...fetchOptions, headers: retryHeaders })
              if (response.status !== 401) return response
            }
          } catch {
            // Fall through to clear and redirect
          }
        } else {
          isRefreshing = true

          // Assign refreshPromise synchronously so parallel requests wait on it
          refreshPromise = (async () => {
            // Import AuthService dynamically to avoid circular dependency
            const { default: AuthService } = await import('@/services/api/auth.service')
            const refreshed = await AuthService.refreshToken()
            const payload = refreshed?.data || refreshed

            if (payload && payload.access_token) {
              storeTokens(payload)

              return payload
            } else {
              throw new Error('No access token in refresh response')
            }
          })()
            .then(payload => {
              isRefreshing = false
              refreshPromise = null

              return payload
            })
            .catch(err => {
              isRefreshing = false
              refreshPromise = null
              clearAuthAndRedirect()
              throw err
            })

          try {
            const refreshed = await refreshPromise

            // Retry request with new token
            const retryHeaders = { ...headers, Authorization: `Bearer ${refreshed.access_token}` }

            response = await fetch(url, { ...fetchOptions, headers: retryHeaders })
            if (response.status !== 401) return response
          } catch {
            // Fall through to clear and redirect
          }
        }
      }

      // If we reach here, refresh did not produce a usable token
      clearAuthAndRedirect()
      throw new Error('Authentication failed. Please log in again.')
    }

    return response
  } catch (error) {
    // Re-throw the error to let callers handle it
    throw error
  }
}

export default apiInterceptor
