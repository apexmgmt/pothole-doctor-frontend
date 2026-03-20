import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { isPublicRoute, isUnauthenticatedRoute } from './constants/routePermission'
import AuthService from './services/api/auth.service'
import { getPermissionsFromCookies, hasRoutePermission } from './utils/role-permission'
import { checkSubdomain } from './utils/utility'
import SubdomainService from './services/api/subdomain.service'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip domain validation for error pages to prevent redirect loops
  if (pathname === '/404' || pathname === '/invalid-subdomain') {
    return NextResponse.next()
  }

  // Handle www redirect - strip www from any domain (except localhost)
  const hostname = req.headers.get('host') || req.nextUrl.hostname

  // If hostname starts with 'www.', redirect to non-www version
  if (hostname.startsWith('www.') && !hostname.includes('localhost')) {
    const newUrl = req.nextUrl.clone()
    const newHostname = hostname.replace(/^www\./, '')

    // Update the URL with the new hostname (without www)
    newUrl.host = newHostname

    return NextResponse.redirect(newUrl, 301) // 301 permanent redirect
  }

  // Check domain first and get domain info
  const domainInfo: any = checkSubdomain(req)

  let tenantId = ''

  // if domain is subdomain and domain info has subdomin then need to verify the subdomain
  if (domainInfo.isSubdomain && domainInfo.subdomain) {
    // if it is a subdomain then need to verify its existence
    try {
      const res = await SubdomainService.verification(domainInfo.subdomain)

      if (res.status !== 'success') {
        const notFoundUrl = req.nextUrl.clone()

        notFoundUrl.pathname = '/invalid-subdomain'

        return NextResponse.redirect(notFoundUrl)
      } else {
        tenantId = res?.data?.tenant_id || ''
      }
    } catch (error) {
      const notFoundUrl = req.nextUrl.clone()

      notFoundUrl.pathname = '/invalid-subdomain'

      return NextResponse.redirect(notFoundUrl)
    }
  }

  let accessToken = req.cookies.get('access_token')?.value
  let refreshToken = req.cookies.get('refresh_token')?.value
  const tokenType = req.cookies.get('token_type')?.value || 'Bearer'

  // If user tries to access unauthenticated routes and already has tokens, redirect to /erp
  if (isUnauthenticatedRoute(pathname) && (accessToken || refreshToken)) {
    const erpUrl = req.nextUrl.clone()

    erpUrl.pathname = '/erp'

    return NextResponse.redirect(erpUrl)
  }

  // if pathname is public or unauthenticated then no need to check further for tokens
  if (isPublicRoute(pathname) || isUnauthenticatedRoute(pathname)) {
    const response = NextResponse.next()

    // Set tenant cookie if subdomain was verified
    if (tenantId) {
      response.cookies.set({
        name: 'tenant',
        value: tenantId,
        httpOnly: false,
        path: '/'
      })
    }

    return response
  }

  // if access token is available 
  if (accessToken) {
    // Check permission for the route
    const permissions = await getPermissionsFromCookies(req)

    if (!hasRoutePermission(pathname, permissions)) {
      const forbiddenUrl = req.nextUrl.clone()

      forbiddenUrl.pathname = '/erp' // or '/403' for a forbidden page

      return NextResponse.redirect(forbiddenUrl)
    }

    const response = NextResponse.next()

    // Set tenant cookie if subdomain was verified
    if (tenantId) {
      response.cookies.set({
        name: 'tenant',
        value: tenantId,
        httpOnly: false,
        path: '/'
      })
    }

    return response
  }

  // if access token is not available but refresh token is available then try to refresh token
  if (refreshToken) {
    try {
      const json = await AuthService.refreshToken(refreshToken)

      const payload = json.data || json
      const newAccess = payload.access_token
      const newRefresh = payload.refresh_token
      const expiresIn = payload.expires_in

      if (!newAccess) {
        throw new Error('No access token returned from refresh')
      }

      const nextRes = NextResponse.next()

      // set the tokens on cookies
      nextRes.cookies.set({
        name: 'access_token',
        value: newAccess,
        httpOnly: false,
        path: '/',
        maxAge: typeof expiresIn === 'number' ? expiresIn : undefined
      })

      if (newRefresh) {
        nextRes.cookies.set({
          name: 'refresh_token',
          value: newRefresh,
          httpOnly: false,
          path: '/'
        })
      }

      if (payload.token_type) {
        nextRes.cookies.set({
          name: 'token_type',
          value: payload.token_type,
          httpOnly: false,
          path: '/'
        })
      }

      // Set tenant cookie if subdomain was verified
      if (tenantId) {
        nextRes.cookies.set({
          name: 'tenant',
          value: tenantId,
          httpOnly: false,
          path: '/'
        })
      }

      // Check permission after token refresh
      const permissions = await getPermissionsFromCookies(req)

      if (!hasRoutePermission(pathname, permissions)) {
        const forbiddenUrl = req.nextUrl.clone()

        forbiddenUrl.pathname = '/erp'

        return NextResponse.redirect(forbiddenUrl)
      }

      return nextRes
    } catch (error) {
      const loginUrl = req.nextUrl.clone()

      loginUrl.pathname = '/erp/login'
      loginUrl.searchParams.set('redirect', pathname)

      const redirectRes = NextResponse.redirect(loginUrl)

      redirectRes.cookies.delete('access_token')
      redirectRes.cookies.delete('refresh_token')
      redirectRes.cookies.delete('token_type')
      redirectRes.cookies.delete('permissions_1')
      redirectRes.cookies.delete('permissions_2')
      redirectRes.cookies.delete('permissions_3')
      redirectRes.cookies.delete('permissions_4')
      redirectRes.cookies.delete('roles')

      return redirectRes
    }
  }

  const loginUrl = req.nextUrl.clone()

  loginUrl.pathname = '/erp/login'
  loginUrl.searchParams.set('redirect', pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|api/|images/|videos/|assets/|static/).*)']
}
