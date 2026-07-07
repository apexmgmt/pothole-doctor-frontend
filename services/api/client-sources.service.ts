import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, CLIENT_SOURCES_ALL, CLIENT_SOURCES_ALL_TENANT } from '@/constants/api'

export default class ClientSourceService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENT_SOURCES_ALL_TENANT : CLIENT_SOURCES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['client-sources-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
