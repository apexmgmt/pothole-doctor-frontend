import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { COMPANIES_ALL } from '@/constants/api'

export default class CompanyService {
  /** Get all companies */
  static getAllCompanies = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMPANIES_ALL, {
        requiresAuth: true,
        method: 'GET',
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
