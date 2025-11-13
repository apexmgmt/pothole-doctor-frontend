import { CityPayload } from '@/types'
import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '../../app/cache.service'
import { CITIES } from '@/constants/api'

export default class CityService {
  /**States DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + CITIES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['cities'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch cities')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create State API */
  static store = async (payload: CityPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CITIES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create state')
      }

      await revalidate('cities')
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (stateId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CITIES + stateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`cities/${stateId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch city details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static update = async (cityId: string, payload: CityPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CITIES + cityId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update city')
      }
      await revalidate('cities')
      await revalidate(`cities/${cityId}`)
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (cityId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + CITIES + cityId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete city')
      }
      await revalidate('cities')
      await revalidate(`cities/${cityId}`)
      await revalidate('locations')
      
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
