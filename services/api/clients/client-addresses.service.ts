import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { CLIENT_ADDRESSES } from '@/constants/api'
import { ClientAddressPayload } from '@/types'

export default class ClientAddressService {
  /**Client Addresses DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + CLIENT_ADDRESSES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client addresses')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Client Addresses API */
  static store = async (payload: ClientAddressPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_ADDRESSES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create client address')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Client Addresses API */
  static show = async (clientAddressId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_ADDRESSES + clientAddressId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client address details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Client Addresses API */
  static update = async (clientAddressId: string, payload: ClientAddressPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_ADDRESSES + clientAddressId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update client address')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Client Addresses API */
  static destroy = async (clientAddressId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENT_ADDRESSES + clientAddressId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete client address')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
