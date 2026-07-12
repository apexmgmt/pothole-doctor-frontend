import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, CLIENT_DOCUMENTS, CLIENT_DOCUMENTS_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'

export default class ClientDocumentService {
  /**Client Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_DOCUMENTS_TENANT : CLIENT_DOCUMENTS) + (queryParams ? `?${queryParams}` : ''),
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

  /**Create Client Document API */
  static store = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENT_DOCUMENTS_TENANT : CLIENT_DOCUMENTS), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Client Document API */
  static show = async (clientDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_DOCUMENTS_TENANT : CLIENT_DOCUMENTS) + clientDocumentId,
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

  /** Update Client Document API */
  static update = async (clientDocumentId: string, payload: FormData) => {
    try {
      const isTenantApi = await isTenant()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_DOCUMENTS_TENANT : CLIENT_DOCUMENTS) + clientDocumentId,
        {
          requiresAuth: true,
          method: 'POST',
          body: payload // Pass FormData directly
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Client Document API */
  static destroy = async (clientDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_DOCUMENTS_TENANT : CLIENT_DOCUMENTS) + clientDocumentId,
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
