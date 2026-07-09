import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  PARTNER_TYPES,
  PARTNER_TYPES_ALL,
  PARTNER_TYPES_ALL_TENANT,
  PARTNER_TYPES_TENANT
} from '@/constants/api'
import { PartnerTypePayload } from '@/types'

export default class PartnerTypesService {
  /**Partner Types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_TYPES_TENANT : PARTNER_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'partner-types', queryParams ? `partner-types?${queryParams}` : 'partner-types'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Partner Types API */
  static store = async (payload: PartnerTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNER_TYPES_TENANT : PARTNER_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['partner-types', 'partner-types-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Partner Types API */
  static show = async (partnerTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_TYPES_TENANT : PARTNER_TYPES) + partnerTypeId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', `partner-types/${partnerTypeId}`] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Partner Types API */
  static update = async (partnerTypeId: string, payload: PartnerTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_TYPES_TENANT : PARTNER_TYPES) + partnerTypeId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['partner-types', 'partner-types-all', `partner-types/${partnerTypeId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner Types API */
  static destroy = async (partnerTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNER_TYPES_TENANT : PARTNER_TYPES) + partnerTypeId,
        {
          requiresAuth: true,
          method: 'DELETE',
          revalidateTags: ['partner-types', 'partner-types-all', `partner-types/${partnerTypeId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all partner types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNER_TYPES_ALL_TENANT : PARTNER_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['login', 'partner-types-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
