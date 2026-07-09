import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  PAYMENT_TERMS,
  PAYMENT_TERMS_ALL,
  PAYMENT_TERMS_ALL_TENANT,
  PAYMENT_TERMS_TENANT,
  PAYMENT_TERMS_TYPES,
  PAYMENT_TERMS_TYPES_TENANT
} from '@/constants/api'
import { PaymentTermPayload } from '@/types'

export default class PaymentTermsService {
  /**Payment Terms DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: {
            revalidate: 30,
            tags: ['login', 'payment-terms', queryParams ? `payment-terms?${queryParams}` : 'payment-terms']
          }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Payment Terms API */
  static store = async (payload: PaymentTermPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['payment-terms', 'payment-terms-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Payment Terms API */
  static show = async (paymentTermId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS) + paymentTermId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', `payment-terms/${paymentTermId}`] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Payment Terms API */
  static update = async (paymentTermId: string, payload: PaymentTermPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS) + paymentTermId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['payment-terms', 'payment-terms-all', `payment-terms/${paymentTermId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Payment Terms API */
  static destroy = async (paymentTermId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS) + paymentTermId,
        {
          requiresAuth: true,
          method: 'DELETE',
          revalidateTags: ['payment-terms', 'payment-terms-all', `payment-terms/${paymentTermId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Payment Terms API */
  static restore = async (paymentTermId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PAYMENT_TERMS_TENANT : PAYMENT_TERMS) + paymentTermId + '/restore',
        {
          requiresAuth: true,
          method: 'POST',
          revalidateTags: ['payment-terms', 'payment-terms-all', `payment-terms/${paymentTermId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Payment Term API */
  static getAllPaymentTerms = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PAYMENT_TERMS_ALL_TENANT : PAYMENT_TERMS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'payment-terms-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get Payment Term Types API */
  static getPaymentTermTypes = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PAYMENT_TERMS_TYPES_TENANT : PAYMENT_TERMS_TYPES), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'payment-term-types'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
