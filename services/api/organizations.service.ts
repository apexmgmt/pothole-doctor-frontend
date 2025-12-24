import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { ORGANIZATIONS, ORGANIZATION_STATUS_CHANGE } from '@/constants/api'
import { revalidate } from '../app/cache.service'

export default class OrganizationService {
  /** Company List API */
  static index = async (filterOptions: object = {}, options: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + ORGANIZATIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['organizations', 'login'] }, // Cache for 60 seconds
        ...options
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch companies')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create company API */
  static store = async (payload: object) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ORGANIZATIONS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create company')
      }

      // Revalidate organizations cache tag
      await revalidate('organizations')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get Organization Details */
  static show = async (organizationId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ORGANIZATIONS + organizationId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`organizations/${organizationId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch company details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Organization Details */
  static update = async (organizationId: string, payload: object) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ORGANIZATIONS + organizationId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update company details')
      }

      // Revalidate organizations cache tag
      await revalidate('organizations')
      await revalidate(`organizations/${organizationId}`)
      
return await response.json()
    } catch (error) {}
  }

  /** Organization status change */
  static changeStatus = async (organizationId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + ORGANIZATION_STATUS_CHANGE, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify({ id: organizationId })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to change company status')
      }

      // Revalidate organizations cache tag
      await revalidate('organizations')
      await revalidate(`organizations/${organizationId}`)
      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
