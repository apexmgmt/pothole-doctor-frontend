import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, TAX_TYPES, TAX_TYPES_TENANT } from '@/constants/api'

export default class TaxTypeService {
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TAX_TYPES_TENANT : TAX_TYPES), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['tax-types'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
