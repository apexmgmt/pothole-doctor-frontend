import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, CLIENT_NOTES, CLIENT_NOTES_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { ClientNotePayload } from '@/types'

export default class ClientNoteService {
  /**Client Notes DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_NOTES_TENANT : CLIENT_NOTES) + (queryParams ? `?${queryParams}` : ''),
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

  /**Create Client Notes API */
  static store = async (payload: ClientNotePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENT_NOTES_TENANT : CLIENT_NOTES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('client-notes')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Client Notes API */
  static show = async (clientNoteId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_NOTES_TENANT : CLIENT_NOTES) + clientNoteId,
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

  /** Update Client Notes API */
  static update = async (clientNoteId: string, payload: ClientNotePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_NOTES_TENANT : CLIENT_NOTES) + clientNoteId,
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

  /** Delete Client Notes API */
  static destroy = async (clientNoteId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENT_NOTES_TENANT : CLIENT_NOTES) + clientNoteId,
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
