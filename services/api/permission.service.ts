import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, PERMISSIONS, PERMISSIONS_TENANT } from '@/constants/api'

export default class PermissionService {
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PERMISSIONS_TENANT : PERMISSIONS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['permissions'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch permissions')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
