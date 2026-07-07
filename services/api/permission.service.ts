import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, PERMISSIONS, PERMISSIONS_TENANT } from '@/constants/api'

export default class PermissionService {
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PERMISSIONS_TENANT : PERMISSIONS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['permissions'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
