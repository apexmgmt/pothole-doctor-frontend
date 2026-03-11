import { InvoiceServicePayload } from '@/types/invoices'
import {
  API_URL,
  APPROVE_INVOICE,
  INVOICES,
  INVOICES_MARKED_SIGNED,
  INVOICES_RESTORE,
  INVOICES_SERVICES,
  VIEW_INVOICE
} from '@/constants/api'
import apiInterceptor from '../api.interceptor'
import { InvoicePayload } from '@/types'

export default class InvoiceService {
  /**
   * Fetches a list of invoices based on the provided filter options.
   *
   * @param filterOptions An object containing key-value pairs for filtering the invoices.
   * @returns A promise that resolves to the list of invoices matching the filter criteria.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static index = async (filterOptions: object) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + INVOICES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['invoices'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoices')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Creates a new invoice with the provided payload. (Step 1 like estimate creation)
   */
  static store = async (payload: InvoicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES, {
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
   * Adds a service to an existing invoice.
   * @param invoiceId The ID of the invoice to which the service will be added.
   * @param payload The payload containing the service details.
   * @returns A promise that resolves to the added service data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static storeServices = async (invoiceId: string, payload: InvoiceServicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_SERVICES(invoiceId), {
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
   * Fetches the details of a specific invoice by its ID.
   *
   * @param invoiceId The ID of the invoice to be fetched.
   * @returns A promise that resolves to the invoice data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static show = async (invoiceId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES + invoiceId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoice')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates an existing invoice with the provided payload.
   *
   * @param invoiceId The ID of the invoice to be updated.
   * @param payload An object containing the updated invoice data.
   * @returns A promise that resolves to the updated invoice data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static update = async (invoiceId: string, payload: InvoicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES + invoiceId, {
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
   * Updates the services of an existing invoice with the provided payload.
   *
   * @param invoiceId The ID of the invoice whose services will be updated.
   * @param payload An object containing the updated services data.
   * @returns A promise that resolves to the updated services data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static updateServices = async (invoiceId: string, payload: InvoiceServicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_SERVICES(invoiceId), {
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
   * Deletes an existing invoice by its ID.
   *
   * @param invoiceId The ID of the invoice to be deleted.
   * @returns A promise that resolves to the deletion response if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static destroy = async (invoiceId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES + invoiceId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete invoice')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Restores a deleted invoice by its ID.
   *
   * @param invoiceId The ID of the invoice to be restored.
   * @returns A promise that resolves to the restored invoice data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static restore = async (invoiceId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_RESTORE(invoiceId), {
        requiresAuth: true,
        method: 'PUT'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore invoice')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Views an invoice based on the provided invoice hash ID and client hash ID.
   *
   * @param invoiceHashId The hash ID of the invoice to be viewed.
   * @param clientHashId The hash ID of the client associated with the invoice.
   * @returns A promise that resolves to the invoice data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static viewInvoice = async (invoiceHashId: string, clientHashId: string) => {
    try {
      const response = await apiInterceptor(API_URL + VIEW_INVOICE(invoiceHashId, clientHashId), {
        requiresAuth: false,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to view invoice')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static approveInvoice = async (invoice_id: string, payload: FormData) => {
    try {
      const response = await apiInterceptor(API_URL + APPROVE_INVOICE, {
        requiresAuth: false,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to approve invoice')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Marks an invoice as signed based on the provided invoice ID.
   *
   * @param invoiceId The ID of the invoice to be marked as signed.
   * @returns A promise that resolves to the updated invoice data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static markSigned = async (invoiceId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICES_MARKED_SIGNED(invoiceId), {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to mark invoice as signed')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
