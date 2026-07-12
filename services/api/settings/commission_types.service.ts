import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  COMMISSION_TYPES_ALL,
  COMMISSION_TYPES,
  API_URL,
  COMMISSION_TYPES_TENANT,
  COMMISSION_TYPES_ALL_TENANT
} from '@/constants/api'
import { CommissionTypePayload } from '@/types'

export default class CommissionTypeService {
  /**Commission Type DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: {
            revalidate: 30,
            tags: ['login', 'commission-types', queryParams ? `commission-types?${queryParams}` : 'commission-types']
          }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Commission Type API */
  static store = async (payload: CommissionTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['commission-types', 'commission-types-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Commission Type API */
  static show = async (commissionTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', `commission-types/${commissionTypeId}`] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Commission Type API */
  static update = async (commissionTypeId: string, payload: CommissionTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['commission-types', 'commission-types-all', `commission-types/${commissionTypeId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Commission Type API */
  static destroy = async (commissionTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'DELETE',
          revalidateTags: ['commission-types', 'commission-types-all', `commission-types/${commissionTypeId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all commission types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? COMMISSION_TYPES_ALL_TENANT : COMMISSION_TYPES_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['login', 'commission-types-all'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
