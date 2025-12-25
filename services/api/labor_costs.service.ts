import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { LABOR_COSTS } from '@/constants/api'
import { LaborCostPayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class LaborCostService {
  /**Labor costs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + LABOR_COSTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['labor-costs'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch labor costs')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Labor cost API */
  static store = async (payload: LaborCostPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LABOR_COSTS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create labor cost')
      }

      await revalidate('labor-costs')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Labor Cost API */
  static show = async (laborCostId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LABOR_COSTS + laborCostId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`labor-costs/${laborCostId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch labor cost details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Labor Cost API */
  static update = async (laborCostId: string, payload: LaborCostPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LABOR_COSTS + laborCostId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update labor cost')
      }

      await revalidate('labor-costs')
      await revalidate(`labor-costs/${laborCostId}`)
      await revalidate('labor-costs-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Labor Cost API */
  static destroy = async (laborCostId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + LABOR_COSTS + laborCostId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete labor cost')
      }

      await revalidate('labor-costs')
      await revalidate(`labor-costs/${laborCostId}`)
      await revalidate('labor-costs-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
