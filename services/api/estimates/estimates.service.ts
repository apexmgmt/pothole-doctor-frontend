import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { ESTIMATES_ALL, ESTIMATES } from '@/constants/api'
import { EstimatePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class EstimateService {
  /**Estimate DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + ESTIMATES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['estimates'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimates')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate API */
  static store = async (payload: EstimatePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create estimates')
      }

      await revalidate('estimates')
      await revalidate('estimates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate API */
  static show = async (estimateId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATES + estimateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`estimates/${estimateId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimates details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate API */
  static update = async (estimateId: string, payload: EstimatePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATES + estimateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update estimate')
      }

      await revalidate('estimates')
      await revalidate(`estimates/${estimateId}`)
      await revalidate('estimates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate API */
  static destroy = async (estimateId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATES + estimateId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete estimate')
      }

      await revalidate('estimates')
      await revalidate(`estimates/${estimateId}`)
      await revalidate('estimates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all estimates API */
  static getAllEstimates = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['estimates-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimates')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
