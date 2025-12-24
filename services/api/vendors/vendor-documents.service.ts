import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { VENDOR_DOCUMENTS } from '@/constants/api'
import { DocumentPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorDocumentService {
  /**Vendor Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + VENDOR_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['vendor-documents'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendor documents')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor API */
  static store = async (payload: any) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to add document')
      }

      await revalidate('vendor-documents')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Document API */
  static show = async (vendorDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_DOCUMENTS + vendorDocumentId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`vendor-documents/${vendorDocumentId}`] } // Cache for 60 seconds
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

  /** Update Vendor Document API */
  static update = async (vendorDocumentId: string, payload: FormData) => {
    try {
      const apiUrl: string = await getApiUrl()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await apiInterceptor(apiUrl + VENDOR_DOCUMENTS + vendorDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update document')
      }

      await revalidate('vendor-documents')
      await revalidate(`vendor-documents/${vendorDocumentId}`)
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Document API */
  static destroy = async (vendorDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_DOCUMENTS + vendorDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete document')
      }

      await revalidate('vendor-documents')
      await revalidate(`vendor-documents/${vendorDocumentId}`)
      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
