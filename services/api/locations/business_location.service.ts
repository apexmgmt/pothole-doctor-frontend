import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { BUSINESS_LOCATIONS, BUSINESS_LOCATIONS_ALL } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { BusinessLocationPayload } from '@/types'

export default class BusinessLocationService {
  /**Business Locations DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['business-locations'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch business locations')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Business Location API */
  static store = async (payload: BusinessLocationPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create state')
      }

      await revalidate('business-locations')
      await revalidate('business-locations-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Business Location API */
  static show = async (businessLocationId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS + businessLocationId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`business-locations/${businessLocationId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch business location details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Business Location API */
  static update = async (businessLocationId: string, payload: BusinessLocationPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS + businessLocationId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update business location')
      }

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Business Location API */
  static destroy = async (businessLocationId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS + businessLocationId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete business location')
      }

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Business Location API */
  static restore = async (businessLocationId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS + businessLocationId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore business location')
      }

      await revalidate('business-locations')
      await revalidate(`business-locations/${businessLocationId}`)
      await revalidate('business-locations-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all business locations */
  static getAllBusinessLocations = async () => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + BUSINESS_LOCATIONS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 300, tags: ['business-locations-all'] } // Cache for 5 minutes
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch all business locations')
      }

      const result = await response.json()

      
return result.data
    } catch (error) {
      throw error
    }
  }
}
