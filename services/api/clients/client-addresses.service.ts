import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, CLIENT_ADDRESSES, CLIENT_ADDRESSES_TENANT } from '@/constants/api'
import { ClientAddressPayload } from '@/types'

export default class ClientAddressService {
  /**Client Addresses DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_ADDRESSES_TENANT : CLIENT_ADDRESSES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Client Addresses API */
  static store = async (payload: ClientAddressPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENT_ADDRESSES_TENANT : CLIENT_ADDRESSES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Client Addresses API */
  static show = async (clientAddressId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_ADDRESSES_TENANT : CLIENT_ADDRESSES) + clientAddressId,
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Client Addresses API */
  static update = async (clientAddressId: string, payload: ClientAddressPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_ADDRESSES_TENANT : CLIENT_ADDRESSES) + clientAddressId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Client Addresses API */
  static destroy = async (clientAddressId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_ADDRESSES_TENANT : CLIENT_ADDRESSES) + clientAddressId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
