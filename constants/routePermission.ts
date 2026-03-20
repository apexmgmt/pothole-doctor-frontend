/**
 * Routes with permission
 * route: 'permission_name' (who can access that route)
 */
export const PERMISSION_BASED_ROUTES: Record<string, string> = {
  // Companies routes
  '/erp/companies': 'Manage Company',
  '/erp/companies/create': 'Create Company',
  '/erp/companies/[id]/edit': 'Update Company',
  '/erp/companies/[id]': 'View Company',

  // Contractor routes
  '/erp/contractors': 'Manage Contractor',

  // Staffs routes
  '/erp/staffs': 'Manage Staff',
  '/erp/staffs/create': 'Create Staff',
  '/erp/staffs/[id]/edit': 'Update Staff',

  // Roles routes
  '/erp/roles': 'Manage Role',
  '/erp/roles/create': 'Create Role',
  '/erp/roles/[id]/edit': 'Update Role',

  // Vendors routes
  '/erp/vendors': 'Manage Vendor',

  // Warehouses routes
  '/erp/warehouses': 'Manage Warehouse',

  // Products routes
  '/erp/products': 'Manage Product',

  // Product Categories routes
  '/erp/products/categories': 'Manage Category',

  // Leads routes
  '/erp/leads': 'Manage Lead',

  // Leads Interest Levels routes
  '/erp/leads/interest-levels': 'Manage Interest Level',

  // Customers routes
  '/erp/customers': 'Manage Customer',

  // Estimate routes
  '/erp/estimates': 'Manage Estimate',
  '/erp/estimates/[id]': 'View Estimate',
  '/erp/invoices': 'Manage Invoice',
  '/erp/work-orders': 'Manage Work Order',

  // Tasks routes
  '/erp/tasks': 'Manage Task',

  // Labor cost routes
  '/erp/labor-costs': 'Manage Labor Cost',

  // Locations routes
  '/erp/countries': 'Manage Country',
  '/erp/states': 'Manage State',
  '/erp/cities': 'Manage City',
  '/erp/locations/businesses': 'Manage Location',
  '/erp/locations/businesses/create': 'Create Location',
  '/erp/locations/businesses/[id]/edit': 'Update Location',

  // Settings routes
  '/erp/settings/payment-terms': 'Manage Payment Term',
  '/erp/settings/contractor-types': 'Manage Contractor Type',
  '/erp/settings/contact-types': 'Manage Contact Type',
  '/erp/settings/estimate-types': 'Manage Estimate Type',
  '/erp/settings/commission-types': 'Manage Commission',
  '/erp/settings/commissions': 'Manage Commission',
  '/erp/settings/note-types': 'Manage Note Type',
  '/erp/settings/task-types': 'Manage Task Type',
  '/erp/settings/email-templates': 'Manage Message Template',
  '/erp/settings/task-reminders': 'Manage Task Reminder',
  '/erp/settings/uom-units': 'Manage Unit',
  '/erp/settings/measure-units': 'Manage Unit',
  '/erp/settings/service-types': 'Manage Service Type'
}

/**
 * Type-based routes
 * route: [...types] (which user types can access that route)
 */
export const TYPE_BASED_ROUTES: Record<string, string[]> = {}

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES: string[] = ['/', '/about', '/contact', '/erp/redirecting', '/proposal']

/**
 * Routes that do not require authentication
 */
export const UNAUTHENTICATED_ROUTES: string[] = [
  '/erp/login',
  '/erp/forgot-password',
  '/erp/reset-password',
  '/erp/otp-verification'
]

/**
 * Static route segments that should not be treated as dynamic IDs
 */
const STATIC_SEGMENTS = new Set([
  'create',
  'edit',
  'delete',
  'new',
  'settings',
  'profile',
  'dashboard',
  'list',
  'view',
  'update',
  'categories',
  'types',
  'import',
  'export'
])

/**
 * Normalize pathname to match dynamic route patterns
 * Converts /erp/companies/123/edit to /erp/companies/[id]/edit
 * BUT keeps /erp/companies/create as /erp/companies/create
 */
function normalizePathname(pathname: string): string {
  // Split the pathname into segments
  const segments = pathname.split('/').filter(Boolean)

  // Common dynamic patterns
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const numericPattern = /^\d+$/

  // Replace dynamic segments with [id], [slug], etc.
  const normalizedSegments = segments.map(segment => {
    // Skip static segments (like 'create', 'edit', etc.)
    if (STATIC_SEGMENTS.has(segment.toLowerCase())) {
      return segment
    }

    // Check if segment looks like an ID (UUID or number)
    if (uuidPattern.test(segment) || numericPattern.test(segment)) {
      return '[id]'
    }

    return segment
  })

  const normalized = '/' + normalizedSegments.join('/')

  return normalized
}

/**
 * Check if a route is public (doesn't require authentication)
 */
export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => {
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)

      return regex.test(pathname)
    }

    return route === pathname
  })
}

/**
 * Check if a route is unauthenticated route (doesn't require authentication)
 */
export const isUnauthenticatedRoute = (pathname: string): boolean => {
  return UNAUTHENTICATED_ROUTES.some(route => {
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)

      return regex.test(pathname)
    }

    return route === pathname
  })
}

export interface User {
  permissions?: string[]
  type?: string
  [key: string]: any
}

/**
 * Get required permission for a route (handles dynamic routes)
 */
export const getRequiredPermissionByPath = (pathname: string): string | undefined => {
  // First try exact match
  if (PERMISSION_BASED_ROUTES[pathname]) {
    return PERMISSION_BASED_ROUTES[pathname]
  }

  // Then try normalized path for dynamic routes
  const normalizedPath = normalizePathname(pathname)
  const permission = PERMISSION_BASED_ROUTES[normalizedPath]

  return permission
}

/**
 * Check if user has permission for a specific route
 */
export const hasRouteAccess = (pathname: string, user: User, permissions: string[]): boolean => {
  if (isPublicRoute(pathname)) {
    return true
  }

  if (!permissions) {
    return false
  }

  const requiredPermission = getRequiredPermissionByPath(pathname)

  if (requiredPermission) {
    return permissions?.includes(requiredPermission) || false
  }

  const allowedTypes = TYPE_BASED_ROUTES[pathname] ?? null

  if (allowedTypes) {
    return allowedTypes.includes(user.guard ?? '')
  }

  return true
}
