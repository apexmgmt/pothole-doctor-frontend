import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  CONTACT_TYPES,
  CONTACT_TYPES_ALL,
  CONTACT_TYPES_ALL_TENANT,
  CONTACT_TYPES_TENANT
} from '@/constants/api'
import { ContactTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ContactTypeService {
  /**Contact types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CONTACT_TYPES_TENANT : CONTACT_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['contact-types'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Contact Types API */
  static store = async (payload: ContactTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CONTACT_TYPES_TENANT : CONTACT_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('contact-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Contact Types API */
  static show = async (contactTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CONTACT_TYPES_TENANT : CONTACT_TYPES) + contactTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`contact-types/${contactTypeId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Contact Types API */
  static update = async (contactTypeId: string, payload: ContactTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CONTACT_TYPES_TENANT : CONTACT_TYPES) + contactTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('contact-types')
      await revalidate(`contact-types/${contactTypeId}`)
      await revalidate('contact-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Contact Types API */
  static destroy = async (contactTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CONTACT_TYPES_TENANT : CONTACT_TYPES) + contactTypeId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('contact-types-all')
      await revalidate(`contact-types/${contactTypeId}`)
      await revalidate('contact-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Contact Types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CONTACT_TYPES_ALL_TENANT : CONTACT_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['contact-types-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
