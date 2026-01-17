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

  if (hostname.startsWith('www.') && !hostname.includes('localhost')) {
    const newUrl = req.nextUrl.clone()
    const newHostname = hostname.replace(/^www\./, '')

    // Update the URL with the new hostname (without www)
    newUrl.host = newHostname

    console.log('Proxy: Redirecting from www -', hostname, 'to', newHostname)

    return NextResponse.redirect(newUrl, 301) // 301 permanent redirect
  }

  // Check domain first
  console.log('Proxy: Checking subdomain...')
  const domainInfo = checkSubdomain(req)

  console.log('Proxy: Domain info result:', domainInfo)

  if (domainInfo.isSubdomain && domainInfo.subdomain) {
    console.log('Proxy: Subdomain detected:', domainInfo.subdomain)

    // if it is a subdomain then need to verify its existence
    try {
      const res = await SubdomainService.verification(domainInfo.subdomain)

      if (res.status !== 'success') {
        console.log('Proxy: Subdomain verification failed - redirecting to /invalid-subdomain')
        const notFoundUrl = req.nextUrl.clone()

        notFoundUrl.pathname = '/invalid-subdomain'

        return NextResponse.redirect(notFoundUrl)
      }
    } catch (error) {
      console.log('Proxy: Subdomain verification error - redirecting to /invalid-subdomain', error)
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
    console.log('Proxy: Unauthenticated route')
    const erpUrl = req.nextUrl.clone()

    erpUrl.pathname = '/erp'

    return NextResponse.redirect(erpUrl)
  }

  if (isPublicRoute(pathname) || isUnauthenticatedRoute(pathname)) {
    console.log('Proxy: Public route')

    return NextResponse.next()
  }

  if (accessToken) {
    console.log('Proxy: Access token available')

    // Check permission for the route
    const permissions = await getPermissionsFromCookies(req)

    if (!hasRoutePermission(pathname, permissions)) {
      console.log('Proxy: User does not have permission for this route')

      const forbiddenUrl = req.nextUrl.clone()

      forbiddenUrl.pathname = '/erp' // or '/403' for a forbidden page

      return NextResponse.redirect(forbiddenUrl)
    }

    return NextResponse.next()
  }

  if (refreshToken) {
    console.log('Proxy: Access token is not available')
    console.log('Proxy: Refresh token is available')

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

      console.log('Proxy: Refreshing token successful')

      // Check permission after token refresh
      const permissions = await getPermissionsFromCookies(req)

      if (!hasRoutePermission(pathname, permissions)) {
        console.log('Proxy: User does not have permission for this route')

        const forbiddenUrl = req.nextUrl.clone()

        forbiddenUrl.pathname = '/erp'

        return NextResponse.redirect(forbiddenUrl)
      }

      return nextRes
    } catch (error) {
      console.log('Proxy: Failed to refresh token. Clearing cookies and redirecting to login...')

      const loginUrl = req.nextUrl.clone()

      loginUrl.pathname = '/erp/login'
      loginUrl.searchParams.set('redirect', pathname)

      const redirectRes = NextResponse.redirect(loginUrl)

      redirectRes.cookies.delete('access_token')
      redirectRes.cookies.delete('refresh_token')
      redirectRes.cookies.delete('token_type')

      return redirectRes
    }
  }

  console.log('Proxy: Failed to authorized...... Logging out...........')
  const loginUrl = req.nextUrl.clone()

  loginUrl.pathname = '/erp/login'
  loginUrl.searchParams.set('redirect', pathname)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|api/|images/|videos/|assets/|static/).*)']
}
