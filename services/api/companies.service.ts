import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, COMPANIES_ALL, COMPANIES_ALL_TENANT } from '@/constants/api'

export default class CompanyService {
  /** Get all companies */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMPANIES_ALL_TENANT : COMPANIES_ALL), {
        requiresAuth: true,
        method: 'GET'

        // next: { revalidate: 3600, tags: ['companies-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
