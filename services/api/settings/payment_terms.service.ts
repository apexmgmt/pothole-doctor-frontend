import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PAYMENT_TERMS, PAYMENT_TERMS_TYPES } from '@/constants/api'
import { PaymentTermPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class PaymentTermsService {
  /**Payment Terms DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['payment-terms'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment terms')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Payment Terms API */
  static store = async (payload: PaymentTermPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment terms')
      }

      await revalidate('payment-terms')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Payment Terms API */
  static show = async (paymentTermId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS + paymentTermId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`payment-terms/${paymentTermId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment terms details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Payment Terms API */
  static update = async (paymentTermId: string, payload: PaymentTermPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS + paymentTermId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update payment terms')
      }
      await revalidate('payment-terms')
      await revalidate(`payment-terms/${paymentTermId}`)
      await revalidate('payment-terms')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Payment Terms API */
  static destroy = async (paymentTermId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS + paymentTermId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete payment terms')
      }
      await revalidate('payment-terms')
      await revalidate(`payment-terms/${paymentTermId}`)
      await revalidate('payment-terms')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Payment Terms API */
  static restore = async (paymentTermId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS + paymentTermId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to restore payment terms')
      }
      await revalidate('payment-terms')
      await revalidate(`payment-terms/${paymentTermId}`)
      await revalidate('payment-terms')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get Payment Term Types API */
  static getPaymentTermTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + PAYMENT_TERMS_TYPES, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['payment-term-types'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment term types')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
