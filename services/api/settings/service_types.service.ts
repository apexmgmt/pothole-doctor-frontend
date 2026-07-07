import { SERVICE_TYPES_ALL_TENANT, SERVICE_TYPES_TENANT } from '@/constants/api'
import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, SERVICE_TYPES, SERVICE_TYPES_ALL } from '@/constants/api'
import { ServiceTypePayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class ServiceTypeService {
  /**Service Types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()

      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['service-types'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Service Types API */
  static store = async (payload: ServiceTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('service-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Service Type API */
  static show = async (serviceTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES) + serviceTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`service-types/${serviceTypeId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Service Types API */
  static update = async (serviceTypeId: string, payload: ServiceTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES) + serviceTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Service Types API */
  static destroy = async (serviceTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES) + serviceTypeId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Service Types API */
  static restore = async (serviceTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? SERVICE_TYPES_TENANT : SERVICE_TYPES) + serviceTypeId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Service Types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? SERVICE_TYPES_ALL_TENANT : SERVICE_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['service-type-types'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
