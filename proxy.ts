import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { isPublicRoute, isUnauthenticatedRoute, getRequiredPermission } from './constants/routePermission'
import AuthService from './services/api/auth.service'
import { decryptData } from './utils/encryption'

/**
 * Get permissions from cookies (server-side)
 */
async function getPermissionsFromCookies(req: NextRequest): Promise<string[]> {
  const encryptedPermissions = req.cookies.get('permissions')?.value

  if (!encryptedPermissions) return []

  try {
    const decryptedPermissions = decryptData(encryptedPermissions)
    let userPermissions: string[] = []

    if (process.env.NODE_ENV === 'development') {
      userPermissions =
        typeof decryptedPermissions === 'string' ? JSON.parse(decryptedPermissions) : decryptedPermissions
    } else {
      userPermissions = decryptedPermissions
    }

    return userPermissions
  } catch (error) {
    return []
  }
}

/**
 * Check if user has permission for the current route
 */
function hasRoutePermission(pathname: string, permissions: string[]): boolean {
  const requiredPermission = getRequiredPermission(pathname)

  if (!requiredPermission) {
    // Route doesn't require specific permission
    return true
  }

  return permissions.includes(requiredPermission)
}

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
