import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  COMMISSION_BASES_ALL,
  COMMISSION_BASES_ALL_TENANT,
  COMMISSION_FILTERS_ALL,
  COMMISSION_FILTERS_ALL_TENANT,
  COMMISSION_TYPES_ALL,
  COMMISSIONS,
  COMMISSIONS_TENANT
} from '@/constants/api'
import { CommissionPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class CommissionService {
  /**Commission DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSIONS_TENANT : COMMISSIONS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['commissions'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Commission API */
  static store = async (payload: CommissionPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMMISSIONS_TENANT : COMMISSIONS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('commissions')
      await revalidate('commissions-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Commission API */
  static show = async (commissionId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMMISSIONS_TENANT : COMMISSIONS) + commissionId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`commissions/${commissionId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Commission API */
  static update = async (commissionId: string, payload: CommissionPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMMISSIONS_TENANT : COMMISSIONS) + commissionId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('commissions')
      await revalidate(`commissions/${commissionId}`)
      await revalidate('commissions-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Commission API */
  static destroy = async (commissionId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMMISSIONS_TENANT : COMMISSIONS) + commissionId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('commissions')
      await revalidate(`commissions/${commissionId}`)
      await revalidate('commissions-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all commission filters API */
  static getAllCommissionFilters = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_FILTERS_ALL_TENANT : COMMISSION_FILTERS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['commission-filters-all'] } // Cache for 1 hour
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all commission bases API */
  static getAllCommissionBases = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_BASES_ALL_TENANT : COMMISSION_BASES_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['commission-bases-all'] } // Cache for 1 hour
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
