import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, LOCATIONS_ALL, LOCATIONS_ALL_TENANT } from '@/constants/api'

export default class LocationService {
  /**Locations DataTable API */
  static index = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? LOCATIONS_ALL_TENANT : LOCATIONS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['locations'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch locations')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
