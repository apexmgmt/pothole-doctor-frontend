import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PARTNERS } from '@/constants/api'
import { PartnerPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class PartnerService {
  /**Partner DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + PARTNERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['partners'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch partners')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Partner API */
  static store = async (payload: PartnerPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create partner')
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNERS + partnerId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`partners/${partnerId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch partner details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Partner API */
  static update = async (partnerId: string, payload: PartnerPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNERS + partnerId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update partner')
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNERS + partnerId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete partner')
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNERS + partnerId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore partner')
      }

      await revalidate('partners')
      await revalidate(`partners/${partnerId}`)
      await revalidate('partners-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
