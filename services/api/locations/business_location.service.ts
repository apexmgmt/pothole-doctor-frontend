import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  BUSINESS_LOCATIONS,
  BUSINESS_LOCATIONS_ALL,
  BUSINESS_LOCATIONS_ALL_TENANT,
  BUSINESS_LOCATIONS_TENANT
} from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { BusinessLocationPayload } from '@/types'

export default class BusinessLocationService {
  /**Business Locations DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['business-locations'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Export Business Locations API */
  static exportBusinessLocations = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) +
          'export' +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /**Create Business Location API */
  static store = async (payload: FormData) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      await revalidate('business-locations')
      await revalidate('business-locations-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Business Location API */
  static show = async (businessLocationId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) + businessLocationId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`business-locations/${businessLocationId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Business Location API */
  static update = async (businessLocationId: string, payload: FormData) => {
    try {
      const isTenantApi = await isTenant()

      // append _method=PUT to payload for method spoofing
      payload.append('_method', 'PUT')

      const response = await handleRequest(
        API_URL + (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) + businessLocationId,
        {
          requiresAuth: true,
          method: 'POST',
          body: payload
        }
      )

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Business Location API */
  static destroy = async (businessLocationId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) + businessLocationId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Business Location API */
  static restore = async (businessLocationId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? BUSINESS_LOCATIONS_TENANT : BUSINESS_LOCATIONS) + businessLocationId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all business locations */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? BUSINESS_LOCATIONS_ALL_TENANT : BUSINESS_LOCATIONS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 300, tags: ['business-locations-all'] } // Cache for 5 minutes
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
