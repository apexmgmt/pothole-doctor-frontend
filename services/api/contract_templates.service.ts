import apiInterceptor from './api.interceptor'
import {
  API_URL,
  CONTRACT_TEMPLATES,
  CONTRACT_TEMPLATES_ALL
} from '@/constants/api'
import { ContractTemplatePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ContractTemplateService {
  /**
   * Summary of the index API
   * 
   * Contract templates data with pagination and filter options. 
   * Pass filter to get the filtered results.
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + CONTRACT_TEMPLATES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['contract-templates'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contract templates')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Contract Template API */
  static store = async (payload: ContractTemplatePayload) => {
    try {
      const response = await apiInterceptor(API_URL + CONTRACT_TEMPLATES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('contract-templates')
      await revalidate('contract-templates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Contract Template API */
  static show = async (contractTemplateId: string) => {
    try {
      const response = await apiInterceptor(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`contract-templates/${contractTemplateId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contract template details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Contract Template API */
  static update = async (contractTemplateId: string, payload: ContractTemplatePayload) => {
    try {
      const response = await apiInterceptor(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('contract-templates')
      await revalidate(`contract-templates/${contractTemplateId}`)
      await revalidate('contract-templates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Contract Template API */
  static destroy = async (contractTemplateId: string) => {
    try {
      const response = await apiInterceptor(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete contract templates')
      }

      await revalidate('contract-templates')
      await revalidate(`contract-templates/${contractTemplateId}`)
      await revalidate('contract-templates-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all contract templates API (with optional filters) */
  static getAll = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const url = API_URL + CONTRACT_TEMPLATES_ALL + (queryParams ? `?${queryParams}` : '')

      const response = await apiInterceptor(url, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['contract-templates-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch contract templates')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
