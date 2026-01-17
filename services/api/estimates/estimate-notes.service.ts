import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { ESTIMATE_NOTES } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { EstimateNotePayload } from '@/types'

export default class EstimateNoteService {
  /**Estimate Notes API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + ESTIMATE_NOTES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['estimate-notes'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimate notes')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate Note API */
  static store = async (payload: EstimateNotePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_NOTES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create estimate notes')
      }

      await revalidate('estimate-notes')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate Note API */
  static show = async (estimateNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_NOTES + estimateNoteId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`estimate-notes/${estimateNoteId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch estimate note details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate Note API */
  static update = async (estimateNoteId: string, payload: EstimateNotePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_NOTES + estimateNoteId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update estimate note')
      }

      await revalidate('estimate-notes')
      await revalidate(`estimate-notes/${estimateNoteId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate Note API */
  static destroy = async (estimateNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ESTIMATE_NOTES + estimateNoteId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete estimate note')
      }

      await revalidate('estimate-notes')
      await revalidate(`estimate-notes/${estimateNoteId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
