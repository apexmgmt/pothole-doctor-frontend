import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, LABOR_COSTS, LABOR_COSTS_ALL, LABOR_COSTS_ALL_TENANT, LABOR_COSTS_TENANT } from '@/constants/api'
import { LaborCostPayload } from '@/types'

export default class LaborCostService {
  /**Labor costs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? LABOR_COSTS_TENANT : LABOR_COSTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'labor-costs', queryParams ? `labor-costs?${queryParams}` : 'labor-costs'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Labor cost API */
  static store = async (payload: LaborCostPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LABOR_COSTS_TENANT : LABOR_COSTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['labor-costs', 'labor-costs-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Labor Cost API */
  static show = async (laborCostId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LABOR_COSTS_TENANT : LABOR_COSTS) + laborCostId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `labor-costs/${laborCostId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Labor Cost API */
  static update = async (laborCostId: string, payload: LaborCostPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LABOR_COSTS_TENANT : LABOR_COSTS) + laborCostId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['labor-costs', 'labor-costs-all', `labor-costs/${laborCostId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Labor Cost API */
  static destroy = async (laborCostId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LABOR_COSTS_TENANT : LABOR_COSTS) + laborCostId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['labor-costs', 'labor-costs-all', `labor-costs/${laborCostId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Labor Costs API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? LABOR_COSTS_ALL_TENANT : LABOR_COSTS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 120, tags: ['login', 'labor-costs-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
