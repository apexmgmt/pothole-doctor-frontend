import { CityPayload } from '@/types'
import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '../../app/cache.service'
import { API_URL, CITIES, CITIES_TENANT } from '@/constants/api'

export default class CityService {
  /**Cities DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + (queryParams ? `?${queryParams}` : ''), {
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

  /**Create City API */
  static store = async (payload: CityPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CITIES_TENANT : CITIES), {
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

  static show = async (cityId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`cities/${cityId}`] } // Cache for 60 seconds
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
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
