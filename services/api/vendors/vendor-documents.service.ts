import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, VENDOR_DOCUMENTS, VENDOR_DOCUMENTS_TENANT } from '@/constants/api'
import { DocumentPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorDocumentService {
  /**Vendor Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_DOCUMENTS_TENANT : VENDOR_DOCUMENTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['vendor-documents'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor API */
  static store = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDOR_DOCUMENTS_TENANT : VENDOR_DOCUMENTS), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      await revalidate('vendor-documents')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Document API */
  static show = async (vendorDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_DOCUMENTS_TENANT : VENDOR_DOCUMENTS) + vendorDocumentId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`vendor-documents/${vendorDocumentId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Document API */
  static update = async (vendorDocumentId: string, payload: FormData) => {
    try {
      const isTenantApi = await isTenant()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_DOCUMENTS_TENANT : VENDOR_DOCUMENTS) + vendorDocumentId,
        {
          requiresAuth: true,
          method: 'POST',
          body: payload // Pass FormData directly
        }
      )

      await revalidate('vendor-documents')
      await revalidate(`vendor-documents/${vendorDocumentId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Document API */
  static destroy = async (vendorDocumentId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_DOCUMENTS_TENANT : VENDOR_DOCUMENTS) + vendorDocumentId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('vendor-documents')
      await revalidate(`vendor-documents/${vendorDocumentId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
