import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { INSTALLATION_REQUESTS_ALL } from '@/constants/api'

export default class InstallationRequestService {
  static getAllInstallationRequests = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INSTALLATION_REQUESTS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['installation-requests-all'] } // Cache for 1 hour
      })

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
