import { NavigationItem, NavigationSubItem } from '@/types'

/**
 * Check if user has any of the required permissions (OR logic)
 */
export const hasAnyPermission = (userPermissions: string[], requiredPermissions?: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true

  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

/**
 * Filter menu items based on user permissions
 * If a parent has no permissions but children do, show parent if any child is visible
 */
export const filterMenuByPermissions = (items: NavigationItem[], userPermissions: string[]): NavigationItem[] => {
  return items
    .map(item => {
      // Filter subItems recursively
      const filteredSubItems = item.subItems
        ? item.subItems.filter(subItem => hasAnyPermission(userPermissions, subItem.permissions))
        : undefined

      // Item is visible if:
      // 1. User has required permissions, OR
      // 2. Item has no permission requirement, OR
      // 3. Item has visible children
      const hasPermission = hasAnyPermission(userPermissions, item.permissions)
      const hasVisibleChildren = filteredSubItems && filteredSubItems.length > 0

      if (!hasPermission && !hasVisibleChildren) return null

      return {
        ...item,
        subItems: filteredSubItems && filteredSubItems.length > 0 ? filteredSubItems : undefined
      } as NavigationItem
    })
    .filter((item): item is NavigationItem => item !== null)
}
