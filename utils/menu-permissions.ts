import { NavigationItem, NavigationSubItem } from '@/types'

/**
 * Check if user has any of the required permissions (OR logic)
 */
export const hasAnyPermission = (userPermissions: string[], requiredPermissions?: string[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) return true

  return requiredPermissions.some(permission => userPermissions.includes(permission))
}

/**
 * Recursively filters menu items based on user permissions.
 * 
 * @param items - An array of NavigationItem objects representing the menu structure.
 * @param userPermissions - An array of strings representing the current user's assigned permissions.
 * @returns A filtered array of NavigationItem objects.
 */
export const filterMenuByPermissions = (items: NavigationItem[], userPermissions: string[]): NavigationItem[] => {
  return items
    .map(item => {
      // FIX: Recursively filter children first if they exist
      const filteredSubItems = item.subItems
        ? filterMenuByPermissions(item.subItems as NavigationItem[], userPermissions)
        : undefined

      const hasPermission = hasAnyPermission(userPermissions, item.permissions)
      const hasVisibleChildren = filteredSubItems && filteredSubItems.length > 0

      // If the user has no direct permission AND no children are visible, hide this item
      if (!hasPermission && !hasVisibleChildren) return null

      return {
        ...item,
        subItems: filteredSubItems && filteredSubItems.length > 0 ? filteredSubItems : undefined
      } as NavigationItem
    })
    .filter((item): item is NavigationItem => item !== null)
}
