import { ClientNotePayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { API_URL, INVOICE_NOTES } from '@/constants/api'

export default class InvoiceNoteService {
  /**
   * Get invoice notes API
   * @param invoice_id string
   * @param filterOptions object - Optional query parameters for filtering notes
   */
  static index = async (invoice_id: string, filterOptions: object = {}) => {
    const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

    try {
      const response = await apiInterceptor(
        API_URL + INVOICE_NOTES(invoice_id) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoice notes')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new invoice note
   * @param invoice_id string
   * @param payload ClientNotePayload - The data for the new note
   */
  static store = async (invoice_id: string, payload: ClientNotePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_NOTES(invoice_id), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific invoice note
   * @param invoice_id string
   * @param task_id string
   */
  static show = async (invoice_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_NOTES(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoice note')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a invoice note
   * @param invoice_id string
   * @param task_id string
   * @param payload ClientNotePayload - The updated data for the note
   */
  static update = async (invoice_id: string, task_id: string, payload: ClientNotePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_NOTES(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete Proposal Note Api
   * @param invoice_id
   * @param task_id
   * @returns
   */
  static destroy = async (invoice_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_NOTES(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
