import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  ESTIMATE_TYPES,
  ESTIMATE_TYPES_ALL,
  ESTIMATE_TYPES_ALL_TENANT,
  ESTIMATE_TYPES_TENANT
} from '@/constants/api'
import { EstimateTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class EstimateTypeService {
  /**Estimate types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_TYPES_TENANT : ESTIMATE_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['estimate-types'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate Types API */
  static store = async (payload: EstimateTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATE_TYPES_TENANT : ESTIMATE_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('estimate-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate Types API */
  static show = async (estimateTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_TYPES_TENANT : ESTIMATE_TYPES) + estimateTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`estimate-types/${estimateTypeId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate Types API */
  static update = async (estimateTypeId: string, payload: EstimateTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_TYPES_TENANT : ESTIMATE_TYPES) + estimateTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('estimate-types')
      await revalidate(`estimate-types/${estimateTypeId}`)
      await revalidate('estimate-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate Types API */
  static destroy = async (estimateTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_TYPES_TENANT : ESTIMATE_TYPES) + estimateTypeId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('estimate-types-all')
      await revalidate(`estimate-types/${estimateTypeId}`)
      await revalidate('estimate-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Estimate Types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATE_TYPES_ALL_TENANT : ESTIMATE_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['estimate-types-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
