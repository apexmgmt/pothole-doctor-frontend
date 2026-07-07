import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, LABOR_COSTS, LABOR_COSTS_ALL, LABOR_COSTS_ALL_TENANT, LABOR_COSTS_TENANT } from '@/constants/api'
import { LaborCostPayload } from '@/types'
import { revalidate } from '../app/cache.service'

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
          next: { revalidate: 60, tags: ['labor-costs'] } // Cache for 60 seconds
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
        body: JSON.stringify(payload)
      })

      await revalidate('labor-costs')

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
        next: { revalidate: 60, tags: [`labor-costs/${laborCostId}`] } // Cache for 60 seconds
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
        body: JSON.stringify(payload)
      })

      await revalidate('labor-costs')
      await revalidate(`labor-costs/${laborCostId}`)
      await revalidate('labor-costs-all')

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
        method: 'DELETE'
      })

      await revalidate('labor-costs')
      await revalidate(`labor-costs/${laborCostId}`)
      await revalidate('labor-costs-all')

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
        next: { revalidate: 120, tags: ['labor-costs-all'] } // Cache for 120 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
