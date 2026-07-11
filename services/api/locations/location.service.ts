import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, LOCATIONS_ALL, LOCATIONS_ALL_TENANT } from '@/constants/api'

export default class LocationService {
  /**Locations DataTable API */
  static index = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LOCATIONS_ALL_TENANT : LOCATIONS_ALL), {
        requiresAuth: true,
        next: { revalidate: 3600, tags: ['login', 'locations'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
