import { TaskPayload } from '@/types'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, INVOICE_TASKS } from '@/constants/api'

export default class InvoiceTaskService {
  /**
   * Get invoice tasks API
   * @param invoice_id string
   * @param filterOptions object - Optional query parameters for filtering tasks
   */
  static index = async (invoice_id: string, filterOptions: object = {}) => {
    const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

    try {
      const response = await handleRequest(
        API_URL + INVOICE_TASKS(invoice_id) + (queryParams ? `?${queryParams}` : ''),
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

  /**
   * Create a new invoice task
   * @param invoice_id string
   * @param payload TaskPayload - The data for the new task
   */
  static store = async (invoice_id: string, payload: TaskPayload) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_TASKS(invoice_id), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Get a specific invoice task
   * @param invoice_id string
   * @param task_id string
   */
  static show = async (invoice_id: string, task_id: string) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_TASKS(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a invoice task
   * @param invoice_id string
   * @param task_id string
   * @param payload TaskPayload - The updated data for the task
   */
  static update = async (invoice_id: string, task_id: string, payload: TaskPayload) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_TASKS(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete Invoice Task API
   * @param invoice_id
   * @param task_id
   * @returns
   */
  static destroy = async (invoice_id: string, task_id: string) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_TASKS(invoice_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'DELETE'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
