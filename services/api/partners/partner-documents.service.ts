import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PARTNER_DOCUMENTS, PARTNERS } from '@/constants/api'
import { DocumentPayload, PartnerPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class PartnerDocumentService {
  /**Partner Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + PARTNER_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['partner-documents'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch partner documents')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Partner API */
  static store = async (payload: any) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNER_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to add document')
      }

      await revalidate('partner-documents')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Partner Document API */
  static show = async (partnerDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNER_DOCUMENTS + partnerDocumentId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`partner-documents/${partnerDocumentId}`] } // Cache for 60 seconds
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

  /** Update Partner Document API */
  static update = async (partnerDocumentId: string, payload: FormData) => {
    try {
      const apiUrl: string = await getApiUrl()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await apiInterceptor(apiUrl + PARTNER_DOCUMENTS + partnerDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update document')
      }

      await revalidate('partner-documents')
      await revalidate(`partner-documents/${partnerDocumentId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner Document API */
  static destroy = async (partnerDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PARTNER_DOCUMENTS + partnerDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete document')
      }

      await revalidate('partner-documents')
      await revalidate(`partner-documents/${partnerDocumentId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
