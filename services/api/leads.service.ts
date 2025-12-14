import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { LEADS, LEADS_ALL } from '@/constants/api'
import { LeadPayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class LeadService {
  /** Leads DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEADS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['leads'] }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch leads')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Lead API */
  static store = async (payload: LeadPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create lead')
      }

      await revalidate('leads')
      await revalidate('leads-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead API */
  static show = async (leadId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS + leadId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`leads/${leadId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Lead API */
  static update = async (leadId: string, payload: LeadPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS + leadId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update lead')
      }
      await revalidate('leads')
      await revalidate(`leads/${leadId}`)
      await revalidate('leads-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead API */
  static destroy = async (leadId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS + leadId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lead')
      }
      await revalidate('leads')
      await revalidate(`leads/${leadId}`)
      await revalidate('leads-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Lead API */
  static restore = async (leadId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS + leadId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to restore lead')
      }
      await revalidate('leads')
      await revalidate(`leads/${leadId}`)
      await revalidate('leads-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all leads api */
  static getAllLeads = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEADS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['leads-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch leads')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
