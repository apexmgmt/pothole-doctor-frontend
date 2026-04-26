import { API_URL, SUBDOMAIN_VERIFICATION } from '@/constants/api'
import apiInterceptor from './api.interceptor'

export default class SubdomainService {
  /**
   * Verify subdomain for checking if it exists or not
   * @param subdomain string
   * @returns
   */
  static verification = async (subdomain: string = '') => {
    try {
      const response = await apiInterceptor(API_URL + SUBDOMAIN_VERIFICATION, {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ subdomain })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Subdomain verification failed')
      }

      return response.json()
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
      const response = await apiInterceptor(API_URL + SUBDOMAIN_VERIFICATION + subdomain, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Subdomain availability check failed')
      }

      return response.json()
    } catch (error) {
      throw error
    }
  }
}
