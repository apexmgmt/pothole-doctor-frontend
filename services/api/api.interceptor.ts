import CookieService from '@/services/storage/cookie.service'

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
  // keep same storage strategy as login
  CookieService.store('access_token', data.access_token, { expires: data.expires_in })
  CookieService.store('refresh_token', data.refresh_token)
  CookieService.store('token_type', data.token_type)
}

const clearAuthAndRedirect = async () => {
  await CookieService.delete('access_token')
  await CookieService.delete('refresh_token')
  await CookieService.delete('token_type')
  await CookieService.delete('user')

  // Client-side redirect only (interceptor runs client-side)
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

let isRefreshing = false
let refreshPromise: Promise<any> | null = null

const apiInterceptor = async (url: string, options: ApiInterceptorOptions = {}): Promise<Response> => {
  const { requiresAuth = true, req, serverCookies, _isRetry = false, ...fetchOptions } = options

  // Read tokens
  let accessToken = await CookieService.get('access_token')
  let refreshToken = await CookieService.get('refresh_token')

  // If auth required and access token missing but refresh token exists => try refresh first
  if (requiresAuth && !accessToken && refreshToken && !_isRetry) {
    if (isRefreshing) {
      // Wait for ongoing refresh
      try {
        await refreshPromise
        accessToken = await CookieService.get('access_token')
      } catch (err) {
        clearAuthAndRedirect()
        throw new Error('Unable to refresh token')
      }
    } else {
      isRefreshing = true
      // Import AuthService dynamically to avoid circular dependency
      const { default: AuthService } = await import('@/services/api/auth.service')

      refreshPromise = AuthService.refreshToken()
        .then(refreshed => {
          if (refreshed && refreshed.access_token) {
            storeTokens(refreshed)
            isRefreshing = false
            refreshPromise = null
            return refreshed
          } else {
            isRefreshing = false
            refreshPromise = null
            throw new Error('No access token in refresh response')
          }
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
            await refreshPromise
            const newAccessToken = await CookieService.get('access_token')
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
          // Import AuthService dynamically to avoid circular dependency
          const { default: AuthService } = await import('@/services/api/auth.service')

          refreshPromise = AuthService.refreshToken()
            .then(refreshed => {
              if (refreshed && refreshed.access_token) {
                storeTokens(refreshed)
                isRefreshing = false
                refreshPromise = null
                return refreshed
              } else {
                isRefreshing = false
                refreshPromise = null
                throw new Error('No access token in refresh response')
              }
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
