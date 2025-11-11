import { getApiUrl } from "@/utils/utility"
import apiInterceptor from "./api.interceptor"
import { PERMISSIONS } from "@/constants/api"

export default class PermissionService {
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + PERMISSIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['permissions'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        return errorData.message || 'Failed to fetch permissions'
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
