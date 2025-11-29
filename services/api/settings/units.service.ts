import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { UNITS } from '@/constants/api'
import { UnitPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class UnitService {
  /**Units DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + UNITS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['units'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch units')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Units API */
  static store = async (payload: UnitPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + UNITS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create units')
      }

      await revalidate('units')
      await revalidate('units-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Units API */
  static show = async (unitId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + UNITS + unitId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`units/${unitId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch units details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Units API */
  static update = async (unitId: string, payload: UnitPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + UNITS + unitId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update units')
      }
      await revalidate('units')
      await revalidate(`units/${unitId}`)
      await revalidate('units-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Unit API */
  static destroy = async (unitId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + UNITS + unitId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete units')
      }
      await revalidate('units')
      await revalidate(`units/${unitId}`)
      await revalidate('units-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

}
