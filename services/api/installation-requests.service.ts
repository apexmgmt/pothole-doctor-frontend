import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, INSTALLATION_REQUESTS_ALL, INSTALLATION_REQUESTS_ALL_TENANT } from '@/constants/api'

export default class InstallationRequestService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? INSTALLATION_REQUESTS_ALL_TENANT : INSTALLATION_REQUESTS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['installation-requests-all'] } // Cache for 1 hour
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
