import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, PARTNERS, PARTNERS_ALL_TENANT, PARTNERS_TENANT } from '@/constants/api'
import { PartnerPayload } from '@/types'

export default class PartnerService {
  /**Partner DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'partners', queryParams ? `partners?${queryParams}` : 'partners'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Partner API */
  static store = async (payload: PartnerPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['partners', 'partners-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Partner API */
  static show = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `partners/${partnerId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Partner API */
  static update = async (partnerId: string, payload: PartnerPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['partners', 'partners-all', `partners/${partnerId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Partner API */
  static destroy = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['partners', 'partners-all', `partners/${partnerId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Restore Partner API - This is used to restore a deleted partner. It sends a POST request to the restore endpoint of the API.
   * @name restore
   * @method POST
   * @param {string} partnerId - The ID of the partner to be restored
   * @returns {Promise} - The response from the API after restoring the partner
   */
  static restore = async (partnerId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PARTNERS_TENANT : PARTNERS) + partnerId + '/restore',
        {
          requiresAuth: true,
          method: 'POST',
          revalidateTags: ['partners', 'partners-all', `partners/${partnerId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Get all partners API without pagination
   * This is used for dropdowns and other places where we need to fetch all partners without pagination
   */
  static getAll = async () => {
    try {
      const response = await handleRequest(API_URL + PARTNERS_ALL_TENANT, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'partners-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
