import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import {
  COMMISSION_TYPES_ALL,
  COMMISSION_TYPES,
  API_URL,
  COMMISSION_TYPES_TENANT,
  COMMISSION_TYPES_ALL_TENANT
} from '@/constants/api'
import { CommissionTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class CommissionTypeService {
  /**Commission Type DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['commission-types'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch commission-types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Commission Type API */
  static store = async (payload: CommissionTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create commission types')
      }

      await revalidate('commission-types')
      await revalidate('commission-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Commission Type API */
  static show = async (commissionTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`commission-types/${commissionTypeId}`] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch commission types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Commission Type API */
  static update = async (commissionTypeId: string, payload: CommissionTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update commission types')
      }

      await revalidate('commission-types')
      await revalidate(`commission-types/${commissionTypeId}`)
      await revalidate('commission-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Commission Type API */
  static destroy = async (commissionTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? COMMISSION_TYPES_TENANT : COMMISSION_TYPES) + commissionTypeId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete commission types')
      }

      await revalidate('commission-types')
      await revalidate(`commission-types/${commissionTypeId}`)
      await revalidate('commission-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all commission types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? COMMISSION_TYPES_ALL_TENANT : COMMISSION_TYPES_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['commission-types-all'] } // Cache for 1 hour
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch commission types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
