import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, CLIENT_SOURCES_ALL, CLIENT_SOURCES_ALL_TENANT } from '@/constants/api'

export default class ClientSourceService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SOURCES_ALL_TENANT : CLIENT_SOURCES_ALL), {
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
