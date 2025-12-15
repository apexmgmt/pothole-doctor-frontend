import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_EMAILS } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { LeadEmailPayload } from '@/types'

export default class LeadEmailService {
  /**Lead Email DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_EMAILS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-emails'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead emails')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead Email API */
  static store = async (payload: LeadEmailPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_EMAILS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sent email')
      }

      await revalidate('lead-emails')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead Email API */
  static show = async (leadSmsId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_EMAILS + leadSmsId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-emails/${leadSmsId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead email details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead Email API */
  static update = async (leadSmsId: string, payload: LeadEmailPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LEAD_EMAILS + leadSmsId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead email')
      }
      await revalidate('lead-emails')
      await revalidate(`lead-emails/${leadSmsId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead Email API */
  static destroy = async (leadSmsId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_EMAILS + leadSmsId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead email')
      }
      await revalidate('lead-emails')
      await revalidate(`lead-emails/${leadSmsId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
