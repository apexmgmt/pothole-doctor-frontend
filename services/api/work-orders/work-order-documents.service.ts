import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, WORK_ORDER_DOCUMENTS } from '@/constants/api'

export default class WorkOrderDocumentService {
  /**Work Order Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + WORK_ORDER_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Work Order Document API */
  static store = async (payload: any) => {
    try {
      const response = await handleRequest(API_URL + WORK_ORDER_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Work Order Document API */
  static show = async (workOrderDocumentId: string) => {
    try {
      const response = await handleRequest(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Work Order Document API */
  static update = async (workOrderDocumentId: string, payload: FormData) => {
    try {
      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await handleRequest(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Work Order Document API */
  static destroy = async (workOrderDocumentId: string) => {
    try {
      const response = await handleRequest(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
