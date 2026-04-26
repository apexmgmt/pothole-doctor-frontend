import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, WORK_ORDER_DOCUMENTS } from '@/constants/api'

export default class WorkOrderDocumentService {
  /**Work Order Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + WORK_ORDER_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch work order documents')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Work Order Document API */
  static store = async (payload: any) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDER_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
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

  /** Show Work Order Document API */
  static show = async (workOrderDocumentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch work order document details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Work Order Document API */
  static update = async (workOrderDocumentId: string, payload: FormData) => {
    try {
      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await apiInterceptor(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
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

  /** Delete Work Order Document API */
  static destroy = async (workOrderDocumentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDER_DOCUMENTS + workOrderDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete work order document')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
