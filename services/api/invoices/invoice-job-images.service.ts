import { API_URL, INVOICE_JOB_IMAGES } from '@/constants/api'
import apiInterceptor from '../api.interceptor'

export default class InvoiceJobImageService {
  static index = async (invoiceId: string, type: 'before' | 'after') => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_JOB_IMAGES + `?invoice_id=${invoiceId}&type=${type}`, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoice job images')
      }

      return await response.json()
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
      const response = await apiInterceptor(API_URL + INVOICE_JOB_IMAGES, {
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

  static delete = async (imageId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVOICE_JOB_IMAGES + imageId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete invoice job image')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
