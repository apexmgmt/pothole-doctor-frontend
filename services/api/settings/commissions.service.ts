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
          next: {
            revalidate: 30,
            tags: ['login', 'commissions', queryParams ? `commissions?${queryParams}` : 'commissions']
          }
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
        body: JSON.stringify(payload),
        revalidateTags: ['commissions', 'commissions-all']
      })

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
        next: { revalidate: 30, tags: ['login', `commissions/${commissionId}`] }
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
        body: JSON.stringify(payload),
        revalidateTags: ['commissions', 'commissions-all', `commissions/${commissionId}`]
      })

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
        method: 'DELETE',
        revalidateTags: ['commissions', 'commissions-all', `commissions/${commissionId}`]
      })

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
          next: { revalidate: 30, tags: ['login', 'commission-filters-all'] }
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
          next: { revalidate: 3600, tags: ['login', 'commission-bases-all'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
