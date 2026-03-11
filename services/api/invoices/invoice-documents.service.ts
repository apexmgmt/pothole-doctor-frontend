import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, INVOICES_DOCUMENTS } from '@/constants/api'

export default class InvoiceDocumentService {
  /**Invoice Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + INVOICES_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoice documents')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Invoice Document API */
  static store = async (payload: any) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_DOCUMENTS, {
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

  /** Show Invoice Document API */
  static show = async (invoiceDocumentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_DOCUMENTS + invoiceDocumentId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch document details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Invoice Document API */
  static update = async (invoiceDocumentId: string, payload: FormData) => {
    try {
      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await apiInterceptor(API_URL + INVOICES_DOCUMENTS + invoiceDocumentId, {
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

  /** Delete Invoice Document API */
  static destroy = async (invoiceDocumentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_DOCUMENTS + invoiceDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete document')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
