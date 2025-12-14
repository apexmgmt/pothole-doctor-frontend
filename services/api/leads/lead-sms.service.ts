import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_SMS } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { LeadSmsPayload } from '@/types'

export default class LeadSmsService {
  /**Lead SMS DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_SMS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-sms'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead sms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead SMS API */
  static store = async (payload: LeadSmsPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_SMS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sent sms')
      }

      await revalidate('lead-sms')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead SMS API */
  static show = async (leadSmsId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_SMS + leadSmsId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-sms/${leadSmsId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead sms details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead SMS API */
  static update = async (leadSmsId: string, payload: LeadSmsPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LEAD_SMS + leadSmsId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead sms')
      }
      await revalidate('lead-sms')
      await revalidate(`lead-sms/${leadSmsId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead SMS API */
  static destroy = async (leadSmsId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_SMS + leadSmsId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead sms')
      }
      await revalidate('lead-sms')
      await revalidate(`lead-sms/${leadSmsId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
