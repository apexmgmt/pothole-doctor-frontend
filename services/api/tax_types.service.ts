import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, TAX_TYPES, TAX_TYPES_TENANT } from '@/constants/api'

export default class TaxTypeService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TAX_TYPES_TENANT : TAX_TYPES), {
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
