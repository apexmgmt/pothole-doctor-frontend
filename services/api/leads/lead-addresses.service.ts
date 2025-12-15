import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_ADDRESSES } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { LeadContactPayload } from '@/types'

export default class LeadAddressService {
  /**Lead Addresses DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_ADDRESSES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-addresses'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead addresses')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead Addresses API */
  static store = async (payload: LeadContactPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_ADDRESSES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create lead address')
      }

      await revalidate('lead-addresses')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead Addresses API */
  static show = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_ADDRESSES + leadNoteId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-addresses/${leadNoteId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead address details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead Addresses API */
  static update = async (leadNoteId: string, payload: LeadContactPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LEAD_ADDRESSES + leadNoteId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead address')
      }
      await revalidate('lead-addresses')
      await revalidate(`lead-addresses/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead Addresses API */
  static destroy = async (leadNoteId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_ADDRESSES + leadNoteId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead address')
      }
      await revalidate('lead-addresses')
      await revalidate(`lead-addresses/${leadNoteId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
