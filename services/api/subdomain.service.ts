import { API_URL, SUBDOMAIN_VERIFICATION } from '@/constants/api'
import { handleRequest } from '@/services/api/base.service'

export default class SubdomainService {
  /**
   * Verify subdomain for checking if it exists or not
   * @param subdomain string
   * @returns
   */
  static verification = async (subdomain: string = '') => {
    try {
      const response = await handleRequest(API_URL + SUBDOMAIN_VERIFICATION, {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ subdomain })
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Check subdomain availability
   * @param subdomain string
   * @returns
   */
  static availability = async (subdomain: string = '') => {
    try {
      const response = await handleRequest(API_URL + SUBDOMAIN_VERIFICATION + subdomain, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
