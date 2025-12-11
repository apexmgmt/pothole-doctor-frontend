import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { CLIENT_SOURCES_ALL } from '@/constants/api'

export default class ClientSourceService {
  static getAllClientSources = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CLIENT_SOURCES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['client-sources-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch all client sources')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
