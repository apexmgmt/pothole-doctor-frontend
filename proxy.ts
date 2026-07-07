import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { isPublicRoute, isUnauthenticatedRoute } from './constants/routePermission'
import { CookieKeys } from './constants/cookies'
import { getPermissionsFromCookies, hasRoutePermission } from './utils/role-permission'
import { checkSubdomain } from './utils/utility'
import SubdomainService from './services/api/subdomain.service'
import { encryptRedirectUrl } from './utils/encryption'

const getRedirectRoute = (): string => '/erp'

interface CacheEntry {
  data: any
  timestamp: number
}

const globalForProxy = globalThis as unknown as {
  authRefreshCache?: Map<string, CacheEntry>
  authRefreshLock?: Map<string, Promise<any>>
}

const cache = globalForProxy.authRefreshCache || new Map<string, CacheEntry>()
const lock = globalForProxy.authRefreshLock || new Map<string, Promise<any>>()

if (process.env.NODE_ENV !== 'production') {
  globalForProxy.authRefreshCache = cache
  globalForProxy.authRefreshLock = lock
}

const CACHE_DURATION = 60000

// Copy cookies
const copyCookies = (from: NextResponse, to: NextResponse) => {
  from.cookies.getAll().forEach(cookie => {
    to.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      path: cookie.path
    })
  })
}

// Redirect user by permissions
const redirectToUserRoute = (req: NextRequest, baseRes?: NextResponse) => {
  const url = req.nextUrl.clone()

  url.pathname = getRedirectRoute()
  const redirectRes = NextResponse.redirect(url)

  if (baseRes) {
    copyCookies(baseRes, redirectRes)
  }

  return redirectRes
}

// Clear cookies
const clearAuthCookies = (res: NextResponse) => {
  ;[CookieKeys.ACCESS_TOKEN, CookieKeys.REFRESH_TOKEN, CookieKeys.TOKEN_TYPE].forEach(cookie =>
    res.cookies.delete(cookie)
  )
}

function isTokenExpired(token: string) {
  try {
    const payloadBase64 = token.split('.')[1]
    const decodedJson = atob(payloadBase64)
    const decoded = JSON.parse(decodedJson)
    const exp = decoded.exp
    const now = Date.now() / 1000

    // Add 10 seconds of buffer
    return exp < now + 10
  } catch {
    return true // if we can't parse it, treat it as expired
  }
}

export async function proxy(req: NextRequest) {
  const url = new URL(req.url)
  const { pathname } = req.nextUrl

  // Skip domain validation for error pages to prevent redirect loops
  if (pathname === '/404' || pathname === '/invalid-subdomain') {
    return NextResponse.next()
  }

  // Handle www redirect - strip www from any domain (except localhost)
  const hostname = req.headers.get('host') || req.nextUrl.hostname

  if (hostname.startsWith('www.') && !hostname.includes('localhost')) {
    const newUrl = req.nextUrl.clone()

    newUrl.host = hostname.replace(/^www\./, '')

    return NextResponse.redirect(newUrl, 301)
  }

  // Check domain first and get domain info
  const domainInfo: any = checkSubdomain(req)
  let tenantId = ''

  console.log('[PROXY]: Domain Info: ', domainInfo)

  if (domainInfo.isSubdomain && domainInfo.subdomain) {
    try {
      const res = await SubdomainService.verification(domainInfo.subdomain)

      console.log('[PROXY]: Subdomain Verification Response: ', res)

      // If handleRequest didn't throw an error, the subdomain is valid.
      // Some APIs might return success: true instead of status: 'success'
      if (res.status === 'error' || res.status === 'fail' || res.success === false) {
        const notFoundUrl = req.nextUrl.clone()

        notFoundUrl.pathname = '/invalid-subdomain'

        return NextResponse.redirect(notFoundUrl)
      } else {
        tenantId = res?.data?.tenant_id || res?.tenant_id || ''
      }
    } catch (error) {
      console.log('[PROXY]: Subdomain Verification Error: ', error)
      const notFoundUrl = req.nextUrl.clone()

      notFoundUrl.pathname = '/invalid-subdomain'

      return NextResponse.redirect(notFoundUrl)
    }
  }

  const isUnauth = isUnauthenticatedRoute(url.pathname)
  const requiresAuth = !isPublicRoute(url.pathname) && !isUnauth

  let accessToken = req.cookies.get(CookieKeys.ACCESS_TOKEN)?.value
  let refreshToken = req.cookies.get(CookieKeys.REFRESH_TOKEN)?.value

  if (accessToken && isTokenExpired(accessToken)) {
    accessToken = undefined
  }

  // If route requires login and user has no tokens
  if (requiresAuth && !accessToken && !refreshToken) {
    const loginUrl = req.nextUrl.clone()

    loginUrl.pathname = '/erp/login'
    const encryptedRedirect = await encryptRedirectUrl(pathname)

    loginUrl.searchParams.set('redirect', encryptedRedirect || pathname)

    return NextResponse.redirect(loginUrl)
  }

  /* Refresh token flow */
  if (refreshToken && !accessToken) {
    try {
      const apiUrl = process.env.API_URL || 'http://localhost:8585/api'
      const isTenantApi = !!tenantId

      const refreshUrl = isTenantApi ? `${apiUrl}/v1/tenant/auth/refresh` : `${apiUrl}/v1/auth/refresh`

      const now = Date.now()
      let payload: any

      const cached = cache.get(refreshToken)

      if (cached && now - cached.timestamp < CACHE_DURATION) {
        payload = cached.data
      } else {
        const existing = lock.get(refreshToken)

        if (existing) {
          payload = await existing
        } else {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' }

          if (tenantId) headers['tenant'] = tenantId

          const promise = fetch(refreshUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ refresh_token: refreshToken })
          }).then(async res => {
            if (!res.ok) throw new Error('Refresh failed')
            const json = await res.json()

            return json.data || json
          })

          lock.set(refreshToken, promise)

          try {
            payload = await promise
            cache.set(refreshToken, { data: payload, timestamp: Date.now() })

            // Cleanup
            for (const [key, entry] of cache.entries()) {
              if (Date.now() - entry.timestamp > CACHE_DURATION) {
                cache.delete(key)
              }
            }
          } finally {
            lock.delete(refreshToken)
          }
        }
      }

      const newAccess = payload?.access_token
      const newRefresh = payload?.refresh_token

      if (!newAccess) throw new Error('No access token returned')

      req.cookies.set(CookieKeys.ACCESS_TOKEN, newAccess)
      if (newRefresh) req.cookies.set(CookieKeys.REFRESH_TOKEN, newRefresh)

      const requestHeaders = new Headers(req.headers)

      requestHeaders.set('cookie', req.cookies.toString())
      if (tenantId) requestHeaders.set('tenant', tenantId)

      let nextRes = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })

      if (isUnauth) {
        nextRes = redirectToUserRoute(req, nextRes)
      }

      nextRes.cookies.set(CookieKeys.ACCESS_TOKEN, newAccess, {
        maxAge: payload?.expires_in || 600,
        path: '/',
        httpOnly: false
      })

      if (newRefresh) {
        nextRes.cookies.set(CookieKeys.REFRESH_TOKEN, newRefresh, {
          maxAge: Number(process.env.REFRESH_TOKEN_DURATION || 864000),
          path: '/',
          httpOnly: false
        })
      }

      if (payload?.token_type) {
        nextRes.cookies.set(CookieKeys.TOKEN_TYPE, payload.token_type, { path: '/', httpOnly: false })
      }

      if (tenantId) {
        nextRes.cookies.set(CookieKeys.TENANT, tenantId, { path: '/', httpOnly: false })
      }

      return nextRes
    } catch (error) {
      const loginUrl = req.nextUrl.clone()

      loginUrl.pathname = '/erp/login'
      const encryptedRedirect = await encryptRedirectUrl(pathname)

      loginUrl.searchParams.set('redirect', encryptedRedirect || pathname)
      const redirectRes = NextResponse.redirect(loginUrl)

      clearAuthCookies(redirectRes)

      return redirectRes
    }
  }

  /* Access token flow */
  if (accessToken) {
    if (isUnauth) {
      return redirectToUserRoute(req)
    }

    if (requiresAuth) {
      const permissions = await getPermissionsFromCookies(req)

      if (!hasRoutePermission(pathname, permissions)) {
        const forbiddenUrl = req.nextUrl.clone()

        forbiddenUrl.pathname = '/erp'

        return NextResponse.redirect(forbiddenUrl)
      }
    }

    const response = NextResponse.next()

    if (tenantId) {
      response.cookies.set({
        name: CookieKeys.TENANT,
        value: tenantId,
        httpOnly: false,
        path: '/'
      })
    }

    return response
  }

  const finalResponse = NextResponse.next()

  if (tenantId) {
    finalResponse.cookies.set({
      name: CookieKeys.TENANT,
      value: tenantId,
      httpOnly: false,
      path: '/'
    })
  }

  return finalResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|api/|images/|videos/|assets/|static/).*)']
}
