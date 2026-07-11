import { API_URL, INVOICE_JOB_IMAGES } from '@/constants/api'
import { handleRequest } from '@/services/api/base.service'

export default class InvoiceJobImageService {
  static index = async (invoiceId: string, type: 'before' | 'after') => {
    try {
      const response = await handleRequest(API_URL + INVOICE_JOB_IMAGES + `?invoice_id=${invoiceId}&type=${type}`, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Uploads a new invoice job image for a specific invoice.
   * @param payload: FormData - {invoice_id: string, image: File, type: 'before'|'after'}
   */
  static store = async (payload: FormData) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_JOB_IMAGES, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static delete = async (imageId: string) => {
    try {
      const response = await handleRequest(API_URL + INVOICE_JOB_IMAGES + imageId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
