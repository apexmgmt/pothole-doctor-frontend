import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { CONTACT_TYPES, CONTACT_TYPES_ALL } from '@/constants/api'
import { ContactTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ContactTypeService {
  /**Contact types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['contact-types'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch contact types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Contact Types API */
  static store = async (payload: ContactTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create contact types')
      }

      await revalidate('contact-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Contact Types API */
  static show = async (contactTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES + contactTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`contact-types/${contactTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch contact types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Contact Types API */
  static update = async (contactTypeId: string, payload: ContactTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES + contactTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update contact types')
      }
      await revalidate('contact-types')
      await revalidate(`contact-types/${contactTypeId}`)
      await revalidate('contact-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Contact Types API */
  static destroy = async (contactTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES + contactTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete contact types')
      }
      await revalidate('contact-types-all')
      await revalidate(`contact-types/${contactTypeId}`)
      await revalidate('contact-types')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get All Contact Types API */
  static getAllContactTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CONTACT_TYPES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['contact-types-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch contact types list')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
