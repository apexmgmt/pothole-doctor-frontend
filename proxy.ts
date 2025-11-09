import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, isUnauthenticatedRoute } from './constants/routePermission'
import CookieService from './services/app/cookie.service'
import { AUTH_REFRESH_TOKEN } from '@/constants/api'
import { getApiUrl } from '@/utils/utility'
import AuthService from './services/api/auth.service'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

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
    return NextResponse.next()
  }

  if (refreshToken) {
    console.log('Proxy: Access token is not available')
    console.log('Proxy: Refresh token is available')
    try {
      const json = await AuthService.refreshToken(refreshToken)
      // adapt to your API shape — previous code used response.data.access_token
      const payload = json.data || json
      const newAccess = payload.access_token
      const newRefresh = payload.refresh_token
      const expiresIn = payload.expires_in

      if (!newAccess) {
        throw new Error('No access token returned from refresh')
      }

      // Set tokens on the NextResponse so subsequent requests include them
      const nextRes = NextResponse.next()
      // Set cookie options appropriate for your app (httpOnly, secure, maxAge, path, sameSite...)
      nextRes.cookies.set({
        name: 'access_token',
        value: newAccess,
        httpOnly: true,
        path: '/',
        maxAge: typeof expiresIn === 'number' ? expiresIn : undefined
      })
      if (newRefresh) {
        nextRes.cookies.set({
          name: 'refresh_token',
          value: newRefresh,
          httpOnly: true,
          path: '/'
        })
      }
      if (payload.token_type) {
        nextRes.cookies.set({
          name: 'token_type',
          value: payload.token_type,
          httpOnly: true,
          path: '/'
        })
      }

      console.log('Proxy: Refreshing token successful')
      return nextRes
    } catch (error) {
      console.log('Proxy: Failed to refresh token. Clearing cookies and redirecting to login...')
      // Clear cookies using NextResponse and then redirect
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/erp/login'
      loginUrl.searchParams.set('redirect', pathname)

      const redirectRes = NextResponse.redirect(loginUrl)
      // Clear auth cookies
      redirectRes.cookies.delete('access_token')
      redirectRes.cookies.delete('refresh_token')
      redirectRes.cookies.delete('token_type')
      return redirectRes
    }
  }

  // fallback: redirect to login
  console.log('Proxy: Failed to authorized...... Logging out...........')
  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/erp/login'
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|api/|images/|videos/|assets/|static/).*)']
}
