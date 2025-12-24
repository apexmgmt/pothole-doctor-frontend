import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { CLIENT_EMAILS } from '@/constants/api'
import { ClientEmailPayload } from '@/types'

export default class ClientEmailService {
  /**Client Email DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + CLIENT_EMAILS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client emails')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Client Email API */
  static store = async (payload: ClientEmailPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_EMAILS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to send email')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Client Email API */
  static show = async (clientEmailId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_EMAILS + clientEmailId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client email details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Client Email API */
  static update = async (clientEmailId: string, payload: ClientEmailPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_EMAILS + clientEmailId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update client email')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Client Email API */
  static destroy = async (clientEmailId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_EMAILS + clientEmailId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete client email')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
