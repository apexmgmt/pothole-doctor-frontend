import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { COMPANIES, COMPANY_STATUS_CHANGE } from '@/constants/api'
import { revalidate } from '../app/cache.service'

export default class CompanyService {
  /** Company List API */
  static index = async (filterOptions: object = {}, options: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + COMPANIES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['companies', 'login'] }, // Cache for 60 seconds
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
      const response = await apiInterceptor(apiUrl + COMPANIES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create company')
      }

      // Revalidate companies cache tag
      await revalidate('companies')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get Company Details */
  static show = async (companyId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMPANIES + companyId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`companies/${companyId}`] } // Cache for 60 seconds
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

  /** Update Company Details */
  static update = async (companyId: string, payload: object) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMPANIES + companyId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update company details')
      }

      // Revalidate companies cache tag
      await revalidate('companies')
      return await response.json()
    } catch (error) {}
  }

  /** Company status change */
  static changeStatus = async (companyId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMPANY_STATUS_CHANGE, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify({ id: companyId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change company status')
      }

      // Revalidate companies cache tag
      await revalidate('companies')
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
