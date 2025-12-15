import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_CONTACTS } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { LeadContactPayload } from '@/types'

export default class LeadContactService {
  /**Lead Contacts DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_CONTACTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-contacts'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead contacts')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead Contacts API */
  static store = async (payload: LeadContactPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_CONTACTS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create lead contact')
      }

      await revalidate('lead-contacts')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead Contacts API */
  static show = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_CONTACTS + leadNoteId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-contacts/${leadNoteId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead contact details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead Contacts API */
  static update = async (leadNoteId: string, payload: LeadContactPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LEAD_CONTACTS + leadNoteId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead contact')
      }
      await revalidate('lead-contacts')
      await revalidate(`lead-contacts/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead Contacts API */
  static destroy = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_CONTACTS + leadNoteId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead contact')
      }
      await revalidate('lead-contacts')
      await revalidate(`lead-contacts/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
