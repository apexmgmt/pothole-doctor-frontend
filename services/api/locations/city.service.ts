import { CityPayload } from '@/types'
import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { revalidate } from '../../app/cache.service'
import { API_URL, CITIES, CITIES_TENANT } from '@/constants/api'

export default class CityService {
  /**Cities DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['cities'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create City API */
  static store = async (payload: CityPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CITIES_TENANT : CITIES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('cities')
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }

  static show = async (cityId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`cities/${cityId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static update = async (cityId: string, payload: CityPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('cities')
      await revalidate(`cities/${cityId}`)
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }

  static destroy = async (cityId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CITIES_TENANT : CITIES) + cityId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('cities')
      await revalidate(`cities/${cityId}`)
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }
}
