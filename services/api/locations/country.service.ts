import { CountryPayload } from '@/types'
import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, COUNTRIES, COUNTRIES_TENANT } from '@/constants/api'
import { revalidate } from '../../app/cache.service'

export default class CountryService {
  /**Countries DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COUNTRIES_TENANT : COUNTRIES) + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['countries'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch countries')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Country API */
  static store = async (payload: CountryPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COUNTRIES_TENANT : COUNTRIES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create country')
      }

      await revalidate('countries')
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (countryId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COUNTRIES_TENANT : COUNTRIES) + countryId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`countries/${countryId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch country details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static update = async (countryId: string, payload: CountryPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COUNTRIES_TENANT : COUNTRIES) + countryId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update country')
      }

      await revalidate('countries')
      await revalidate(`countries/${countryId}`)
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (countryId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? COUNTRIES_TENANT : COUNTRIES) + countryId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete country')
      }

      await revalidate('countries')
      await revalidate(`countries/${countryId}`)
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
