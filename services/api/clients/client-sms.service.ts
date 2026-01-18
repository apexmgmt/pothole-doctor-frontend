import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, CLIENT_SMS, CLIENT_SMS_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { ClientSmsPayload } from '@/types'

export default class ClientSmsService {
  /**Client SMS DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SMS_TENANT : CLIENT_SMS) + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client sms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Client SMS API */
  static store = async (payload: ClientSmsPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SMS_TENANT : CLIENT_SMS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to send sms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Client SMS API */
  static show = async (clientSmsId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SMS_TENANT : CLIENT_SMS) + clientSmsId, {
        requiresAuth: true,
        method: 'GET'
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

  /** Update Client SMS API */
  static update = async (clientSmsId: string, payload: ClientSmsPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SMS_TENANT : CLIENT_SMS) + clientSmsId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update client sms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Client SMS API */
  static destroy = async (clientSmsId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENT_SMS_TENANT : CLIENT_SMS) + clientSmsId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete client sms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
