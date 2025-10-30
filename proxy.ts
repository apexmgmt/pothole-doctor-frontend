import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicRoute, isUnauthenticatedRoute } from './constants/routePermission'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  // If user tries to access unauthenticated routes and already has tokens, redirect to /erp
  if (isUnauthenticatedRoute(pathname) && (accessToken || refreshToken)) {
    const erpUrl = req.nextUrl.clone()
    erpUrl.pathname = '/erp'
    return NextResponse.redirect(erpUrl)
  }

  if (isPublicRoute(pathname) || isUnauthenticatedRoute(pathname)) {
    return NextResponse.next()
  }

  if (accessToken) {
    return NextResponse.next()
  }

  if (refreshToken) {
    // Optionally, handle token refresh logic here
    // If refresh fails, fall through to redirect
  }

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/erp/login'
  loginUrl.searchParams.set('redirect', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/|api/|images/|videos/|assets/|static/).*)']
}
