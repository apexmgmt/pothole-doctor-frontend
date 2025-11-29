import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PARTNER_TYPES, PARTNER_TYPES_ALL } from '@/constants/api'
import { PartnerTypePayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class PartnerTypesService {
  /**Partner Types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['partner-types'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment terms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Partner Types API */
  static store = async (payload: PartnerTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create partner types')
      }

      await revalidate('partner-types')
      await revalidate('partner-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Partner Types API */
  static show = async (partnerTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES + partnerTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`partner-types/${partnerTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch partner types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Partner Types API */
  static update = async (partnerTypeId: string, payload: PartnerTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES + partnerTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update partner types')
      }
      await revalidate('partner-types')
      await revalidate(`partner-types/${partnerTypeId}`)
      await revalidate('partner-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner Types API */
  static destroy = async (partnerTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES + partnerTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete partner types')
      }
      await revalidate('partner-types')
      await revalidate(`partner-types/${partnerTypeId}`)
      await revalidate('partner-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all partner types API */
  static getAllPartnerTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PARTNER_TYPES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['partner-types-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch partner types')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
