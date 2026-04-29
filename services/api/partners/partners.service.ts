import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, PARTNERS, PARTNERS_ALL_TENANT, PARTNERS_TENANT } from '@/constants/api'
import { PartnerPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class PartnerService {
  /**Partner DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['partners'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contractors')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Partner API */
  static store = async (payload: PartnerPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create contractors')
      }

      await revalidate('partners')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Partner API */
  static show = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`partners/${partnerId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contractor details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Partner API */
  static update = async (partnerId: string, payload: PartnerPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update contractors')
      }

      await revalidate('partners')
      await revalidate(`partners/${partnerId}`)
      await revalidate('partners-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner API */
  static destroy = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete contractors')
      }

      await revalidate('partners')
      await revalidate(`partners/${partnerId}`)
      await revalidate('partners-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Partner API */
  static restore = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore contractors')
      }

      await revalidate('partners')
      await revalidate(`partners/${partnerId}`)
      await revalidate('partners-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all partners API without pagination
   * This is used for dropdowns and other places where we need to fetch all partners without pagination
   */
  static getAll = async () => {
    try {
      const response = await apiInterceptor(API_URL + PARTNERS_ALL_TENANT, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['partners-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contractors')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
