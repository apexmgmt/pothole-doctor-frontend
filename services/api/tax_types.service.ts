import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { TAX_TYPES } from '@/constants/api'

export default class TaxTypeService {
  static getAllTaxTypes = async () => {
    try {
      const apiUrl = await getApiUrl()
      const response = await apiInterceptor(apiUrl + TAX_TYPES, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['tax-types'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch tax types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
