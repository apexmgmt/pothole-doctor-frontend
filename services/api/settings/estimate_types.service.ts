import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { ESTIMATE_TYPES, ESTIMATE_TYPES_ALL } from '@/constants/api'
import { EstimateTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class EstimateTypeService {
  /**Estimate types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['estimate-types'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimate types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate Types API */
  static store = async (payload: EstimateTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create estimate types')
      }

      await revalidate('estimate-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate Types API */
  static show = async (estimateTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES + estimateTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`estimate-types/${estimateTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimate types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate Types API */
  static update = async (estimateTypeId: string, payload: EstimateTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES + estimateTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update estimate types')
      }

      await revalidate('estimate-types')
      await revalidate(`estimate-types/${estimateTypeId}`)
      await revalidate('estimate-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate Types API */
  static destroy = async (estimateTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES + estimateTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete estimate types')
      }

      await revalidate('estimate-types-all')
      await revalidate(`estimate-types/${estimateTypeId}`)
      await revalidate('estimate-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get All Estimate Types API */
  static getAllNoteTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_TYPES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['estimate-types-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimate types list')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
