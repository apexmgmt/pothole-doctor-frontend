import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { ESTIMATES_ALL, ESTIMATES, API_URL, ESTIMATES_TENANT, ESTIMATES_ALL_TENANT } from '@/constants/api'
import { EstimatePayload, TakeoffData } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class EstimateService {
  /**Estimate DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['estimates'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate API */
  static store = async (payload: EstimatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('estimates')
      await revalidate('estimates-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate API */
  static show = async (estimateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES) + estimateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`estimates/${estimateId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate API */
  static update = async (estimateId: string, payload: EstimatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES) + estimateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('estimates')
      await revalidate(`estimates/${estimateId}`)
      await revalidate('estimates-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate API */
  static destroy = async (estimateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES) + estimateId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('estimates')
      await revalidate(`estimates/${estimateId}`)
      await revalidate('estimates-all')

      return response
    } catch (error) {
      throw error
    }
  }

  static updateTakeOffData = async (estimateId: string, takeOffData: TakeoffData) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATES_TENANT : ESTIMATES) + `${estimateId}/take-off`,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify({ take_off_data: takeOffData })
        }
      )

      await revalidate(`estimates/${estimateId}`)
      await revalidate('estimates')
      await revalidate('estimates-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all estimates API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATES_ALL_TENANT : ESTIMATES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['estimates-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
