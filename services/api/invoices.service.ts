import { API_URL, INVOICES, VIEW_INVOICE } from '@/constants/api'
import apiInterceptor from './api.interceptor'

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

  static store = async () => {}
  static show = async () => {}
  static update = async () => {}
  static destroy = async () => {}
  static restore = async (invoice_id: string) => {}

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
}
