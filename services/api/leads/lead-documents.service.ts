import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { LEAD_DOCUMENTS } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'

export default class LeadDocumentService {
  /**Lead Documents DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + LEAD_DOCUMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['lead-documents'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch lead documents')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Lead Document API */
  static store = async (payload: any) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_DOCUMENTS, {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add document')
      }

      await revalidate('lead-documents')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Lead Document API */
  static show = async (leadDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_DOCUMENTS + leadDocumentId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`lead-documents/${leadDocumentId}`] } // Cache for 60 seconds
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

  /** Update Lead Document API */
  static update = async (leadDocumentId: string, payload: FormData) => {
    try {
      const apiUrl: string = await getApiUrl()

      // Add the _method field to simulate PUT request
      payload.append('_method', 'PUT')

      const response = await apiInterceptor(apiUrl + LEAD_DOCUMENTS + leadDocumentId, {
        requiresAuth: true,
        method: 'POST',
        body: payload // Pass FormData directly
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update document')
      }
      await revalidate('lead-documents')
      await revalidate(`lead-documents/${leadDocumentId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Lead Document API */
  static destroy = async (leadDocumentId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + LEAD_DOCUMENTS + leadDocumentId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete document')
      }
      await revalidate('lead-documents')
      await revalidate(`lead-documents/${leadDocumentId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
