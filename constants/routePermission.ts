/**
 * Routes with permission
 * route: 'permission_name' (who can access that route)
 */
export const PERMISSION_BASED_ROUTES: Record<string, string> = {
  '/users': 'manage user'
}

/**
 * Type-based routes
 * route: [...types] (which user types can access that route)
 */
export const TYPE_BASED_ROUTES: Record<string, string[]> = {
  // '/surveys/deleted': ['admin'],
  // '/follow-up-records': ['member', 'admin'],
}

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/about',
  '/contact',
]

/**
 * Check if a route is public (doesn't require authentication)
 * @param pathname - The current route path
 * @returns True if route is public, false if protected
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => {
    // Handle dynamic routes with parameters (e.g., /billboard/:id)
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)
      return regex.test(pathname)
    }
    // Handle exact matches
    return route === pathname
  })
}

export interface User {
  permissions?: string[]
  type?: string
  [key: string]: any
}

/**
 * Check if user has permission for a specific route
 * @param pathname - The current route path
 * @param user - User object with permissions and type
 * @returns True if user has access, false otherwise
 */
export const hasRouteAccess = (pathname: string, user?: User): boolean => {
  // Check if route is public
  if (isPublicRoute(pathname)) {
    return true
  }

  // If route is not public, user must be authenticated
  if (!user) {
    return false
  }

  // Check permission-based routes
  const requiredPermission = PERMISSION_BASED_ROUTES[pathname]
  if (requiredPermission) {
    return user.permissions?.includes(requiredPermission) || false
  }

  // Check type-based routes
  const allowedTypes = TYPE_BASED_ROUTES[pathname]
  if (allowedTypes) {
    return allowedTypes.includes(user.type ?? '')
  }

  // For all other protected routes, just check if user is authenticated
  return true
}
