import CookieService from '@/services/app/cookie.service'
import { decryptData } from './encryption'
import { getAuthUser } from './auth'
import { NextRequest } from 'next/server'
import { getRequiredPermissionByPath } from '@/constants/routePermission'

/**
 * @name getPermissions
 * @description Retrieve and decrypt user permissions from chunked cookies
 * @returns string[]
 */
export const getPermissions = async (): Promise<string[]> => {
  try {
    // Get all permission chunks
    const chunk1 = (await CookieService.get('permissions_1')) || ''
    const chunk2 = (await CookieService.get('permissions_2')) || ''
    const chunk3 = (await CookieService.get('permissions_3')) || ''

    // Reassemble the encrypted permissions
    const encryptedPermissions = chunk1 + chunk2 + chunk3

    if (!encryptedPermissions) return []

    const decryptedPermissions = decryptData(encryptedPermissions)
    let userPermissions: string[] = []

    if (process.env.NODE_ENV === 'development') {
      // In development, the data might already be an object or a JSON string
      userPermissions =
        typeof decryptedPermissions === 'string' ? JSON.parse(decryptedPermissions) : decryptedPermissions
    } else {
      userPermissions = decryptedPermissions
    }

    return userPermissions
  } catch (error) {
    console.error('Error getting permissions:', error)

    return []
  }
}

/**
 * @name getRoles
 * @description Retrieve and decrypt user roles from cookies
 * @returns string[]
 */
export const getRoles = async (): Promise<string[]> => {
  const encryptedRoles = await CookieService.get('roles')

  if (!encryptedRoles) return []

  try {
    const decryptedRoles = decryptData(encryptedRoles)
    let userRoles: string[] = []

    if (process.env.NODE_ENV === 'development') {
      // In development, the data might already be an object or a JSON string
      userRoles = typeof decryptedRoles === 'string' ? JSON.parse(decryptedRoles) : decryptedRoles
    } else {
      userRoles = decryptedRoles
    }

    return userRoles
  } catch (error) {
    return []
  }
}

/**
 * @name hasPermission
 * @description Check if the user has a specific permission
 * @param permission string
 * @returns boolean
 */
export const hasPermission = async (permission: string): Promise<boolean> => {
  const permissions = await getPermissions()

  return permissions.includes(permission)
}

/**
 * @name hasRole
 * @description Check if the user has a specific role
 * @param role string
 * @returns boolean
 */
export const hasRole = async (role: string): Promise<boolean> => {
  const roles = await getRoles()

  return roles.includes(role)
}

/**
 * @name isGuardType
 * @description Check if the authenticated user has a specific guard type
 * @param guardType string
 * @returns boolean
 */
export const isGuardType = async (guardType: string): Promise<boolean> => {
  const user = await getAuthUser()

  if (!user) return false

  return user?.guard === guardType
}

/**
 * Get permissions from chunked cookies (server-side)
 */
export async function getPermissionsFromCookies(req: NextRequest): Promise<string[]> {
  try {
    // Get all permission chunks
    const chunk1 = req.cookies.get('permissions_1')?.value || ''
    const chunk2 = req.cookies.get('permissions_2')?.value || ''
    const chunk3 = req.cookies.get('permissions_3')?.value || ''

    // Reassemble the encrypted permissions
    const encryptedPermissions = chunk1 + chunk2 + chunk3

    if (!encryptedPermissions) {
      console.log('No permissions cookies found')

      return []
    }

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
    console.error('Error getting permissions from cookies:', error)

    return []
  }
}

/**
 * Check if user has permission for the current route
 */
export function hasRoutePermission(pathname: string, permissions: string[]): boolean {
  const requiredPermission = getRequiredPermissionByPath(pathname)

  if (!requiredPermission) {
    // Route doesn't require specific permission
    return true
  }

  return permissions.includes(requiredPermission)
}
