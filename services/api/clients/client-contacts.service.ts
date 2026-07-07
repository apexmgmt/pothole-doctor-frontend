import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, CLIENT_CONTACTS, CLIENT_CONTACTS_TENANT } from '@/constants/api'
import { ClientContactPayload } from '@/types'

export default class ClientContactService {
  /**Client Contacts DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_CONTACTS_TENANT : CLIENT_CONTACTS) + (queryParams ? `?${queryParams}` : ''),
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

  /**Create Client Contacts API */
  static store = async (payload: ClientContactPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENT_CONTACTS_TENANT : CLIENT_CONTACTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Client Contacts API */
  static show = async (clientContactId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_CONTACTS_TENANT : CLIENT_CONTACTS) + clientContactId,
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

  /** Update Client Contacts API */
  static update = async (clientContactId: string, payload: ClientContactPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_CONTACTS_TENANT : CLIENT_CONTACTS) + clientContactId,
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

  /** Delete Client Contacts API */
  static destroy = async (clientContactId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_CONTACTS_TENANT : CLIENT_CONTACTS) + clientContactId,
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
