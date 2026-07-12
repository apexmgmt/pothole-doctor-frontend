import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, PARTNER_DOCUMENTS, PARTNER_DOCUMENTS_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'

export default class PartnerDocumentService {
  /**Partner Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_DOCUMENTS_TENANT : PARTNER_DOCUMENTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['partner-documents'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Partner API */
  static store = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNER_DOCUMENTS_TENANT : PARTNER_DOCUMENTS), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      await revalidate('partner-documents')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Partner Document API */
  static show = async (partnerDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_DOCUMENTS_TENANT : PARTNER_DOCUMENTS) + partnerDocumentId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`partner-documents/${partnerDocumentId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Partner Document API */
  static update = async (partnerDocumentId: string, payload: FormData) => {
    try {
      const isTenantApi = await isTenant()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_DOCUMENTS_TENANT : PARTNER_DOCUMENTS) + partnerDocumentId,
        {
          requiresAuth: true,
          method: 'POST',
          body: payload // Pass FormData directly
        }
      )

      await revalidate('partner-documents')
      await revalidate(`partner-documents/${partnerDocumentId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner Document API */
  static destroy = async (partnerDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_DOCUMENTS_TENANT : PARTNER_DOCUMENTS) + partnerDocumentId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('partner-documents')
      await revalidate(`partner-documents/${partnerDocumentId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
