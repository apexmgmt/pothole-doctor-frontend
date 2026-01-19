import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, COMPANIES_ALL, COMPANIES_ALL_TENANT } from '@/constants/api'

export default class CompanyService {
  /** Get all companies */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COMPANIES_ALL_TENANT : COMPANIES_ALL), {
        requiresAuth: true,
        method: 'GET'

        // next: { revalidate: 3600, tags: ['companies-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch companies')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
