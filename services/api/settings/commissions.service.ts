import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { COMMISSION_BASES_ALL, COMMISSION_FILTERS_ALL, COMMISSION_TYPES_ALL, COMMISSIONS } from '@/constants/api'
import { CommissionPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class CommissionService {
  /**Commission DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + COMMISSIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['commissions'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch commissions')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Commission API */
  static store = async (payload: CommissionPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSIONS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create commissions')
      }

      await revalidate('commissions')
      await revalidate('commissions-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Commission API */
  static show = async (commissionId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSIONS + commissionId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`commissions/${commissionId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch commissions details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Commission API */
  static update = async (commissionId: string, payload: CommissionPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSIONS + commissionId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update commissions')
      }
      await revalidate('commissions')
      await revalidate(`commissions/${commissionId}`)
      await revalidate('commissions-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Commission API */
  static destroy = async (commissionId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSIONS + commissionId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete commissions')
      }
      await revalidate('commissions')
      await revalidate(`commissions/${commissionId}`)
      await revalidate('commissions-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all commission types API */
  static getAllCommissionTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSION_TYPES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['commission-types-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch commission types')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all commission filters API */
  static getAllCommissionFilters = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSION_FILTERS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['commission-filters-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch commission filters')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all commission bases API */
  static getAllCommissionBases = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + COMMISSION_BASES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['commission-bases-all'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch commission bases')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
