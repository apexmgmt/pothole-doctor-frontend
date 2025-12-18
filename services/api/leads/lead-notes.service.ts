import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_NOTES } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { LeadNotePayload, LeadSmsPayload } from '@/types'

export default class LeadNoteService {
  /**Lead Notes DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_NOTES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-notes'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead notes')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead Notes API */
  static store = async (payload: LeadNotePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_NOTES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create lead notes')
      }

      await revalidate('lead-notes')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead Notes API */
  static show = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_NOTES + leadNoteId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-notes/${leadNoteId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead notes details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead Notes API */
  static update = async (leadNoteId: string, payload: LeadNotePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LEAD_NOTES + leadNoteId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead notes')
      }
      await revalidate('lead-notes')
      await revalidate(`lead-notes/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead Notes API */
  static destroy = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_NOTES + leadNoteId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead notes')
      }
      await revalidate('lead-notes')
      await revalidate(`lead-notes/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
