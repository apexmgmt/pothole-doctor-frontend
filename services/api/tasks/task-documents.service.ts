import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, TASK_DOCUMENTS } from '@/constants/api'

export default class TaskDocumentService {
  /**Task Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + TASK_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Task Document API */
  static store = async (payload: any) => {
    try {
      const response = await handleRequest(API_URL + TASK_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Task Document API */
  static show = async (taskDocumentId: string) => {
    try {
      const response = await handleRequest(API_URL + TASK_DOCUMENTS + taskDocumentId, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Task Document API */
  static update = async (taskDocumentId: string, payload: FormData) => {
    try {
      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await handleRequest(API_URL + TASK_DOCUMENTS + taskDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Task Document API */
  static destroy = async (taskDocumentId: string) => {
    try {
      const response = await handleRequest(API_URL + TASK_DOCUMENTS + taskDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
