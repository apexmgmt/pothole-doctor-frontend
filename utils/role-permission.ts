import CookieService from '@/services/app/cookie.service'
import { decryptData } from './encryption'
import { getAuthUser } from './auth'

/**
 * @name getPermissions
 * @description Retrieve and decrypt user permissions from cookies
 * @returns string[]
 */
export const getPermissions = async (): Promise<string[]> => {
  const encryptedPermissions = await CookieService.get('permissions')

  if (!encryptedPermissions) return []

  try {
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
