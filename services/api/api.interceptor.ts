import AuthService from '@/services/api/auth.service'
import CookieService from '@/services/storage/cookie.service'

interface ApiInterceptorOptions extends RequestInit {
  requiresAuth?: boolean
  req?: any
  res?: any
  serverCookies?: Record<string, string>
}

/**
 * API interceptor that ensures Authorization header has a valid access_token.
 * If access_token is missing and refresh_token exists, it will attempt to refresh the token
 * and store the returned tokens (access_token, refresh_token, token_type, expires_in).
 * On failure to obtain a token the interceptor calls AuthService.logout().
 */
const storeTokens = (data: any) => {
  if (!data) return
  // keep same storage strategy as login
  CookieService.store('access_token', data.access_token, { expires: data.expires_in })
  CookieService.store('refresh_token', data.refresh_token)
  CookieService.store('token_type', data.token_type)
}

const apiInterceptor = async (url: string, options: ApiInterceptorOptions = {}): Promise<Response> => {
  const { requiresAuth = true, req, serverCookies, ...fetchOptions } = options

  // Read tokens
  let accessToken = CookieService.get('access_token')
  let refreshToken = CookieService.get('refresh_token')

  // If auth required and access token missing but refresh token exists => try refresh first
  if (requiresAuth && !accessToken && refreshToken) {
    try {
      const refreshed = await AuthService.refreshToken()
      if (refreshed && refreshed.access_token) {
        storeTokens(refreshed)
        accessToken = refreshed.access_token
        refreshToken = refreshed.refresh_token
      } else {
        // refresh didn't return token => logout
        await AuthService.logout()
        throw new Error('Unable to refresh token')
      }
    } catch (err) {
      await AuthService.logout()
      throw err
    }
  }

  // If auth required and still no access token => logout and fail
  if (requiresAuth && !accessToken) {
    await AuthService.logout()
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

    // If 401 and requiresAuth -> attempt a single refresh (if refresh token available), then retry once.
    if (response.status === 401 && requiresAuth) {
      refreshToken = CookieService.get('refresh_token')

      if (refreshToken) {
        try {
          const refreshed = await AuthService.refreshToken()
          if (refreshed && refreshed.access_token) {
            storeTokens(refreshed)
            // retry request with new access token
            const retryHeaders = { ...headers, Authorization: `Bearer ${refreshed.access_token}` }
            response = await fetch(url, { ...fetchOptions, headers: retryHeaders })
            if (response.status !== 401) return response
          }
        } catch {
          // ignore and proceed to logout below
        }
      }

      // If we reach here, refresh did not produce a usable token -> logout
      await AuthService.logout()
      throw new Error('Authentication failed. Please log in again.')
    }

    return response
  } catch (error) {
    // Re-throw the error to let callers handle it (logout already called where necessary)
    throw error
  }
}

export default apiInterceptor
