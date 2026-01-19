import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, INSTALLATION_REQUESTS_ALL, INSTALLATION_REQUESTS_ALL_TENANT } from '@/constants/api'

export default class InstallationRequestService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? INSTALLATION_REQUESTS_ALL_TENANT : INSTALLATION_REQUESTS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['installation-requests-all'] } // Cache for 1 hour
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch all installation requests')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
