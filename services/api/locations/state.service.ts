import { StatePayload } from '@/types'
import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, STATES, STATES_TENANT } from '@/constants/api'
import { revalidate } from '../../app/cache.service'

export default class StateService {
  /**States DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STATES_TENANT : STATES) + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['states'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch states')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create State API */
  static store = async (payload: StatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STATES_TENANT : STATES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create state')
      }

      await revalidate('states')
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (stateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`states/${stateId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch state details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static update = async (stateId: string, payload: StatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update state')
      }

      await revalidate('states')
      await revalidate(`states/${stateId}`)
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (stateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete state')
      }

      await revalidate('states')
      await revalidate(`states/${stateId}`)
      await revalidate('locations')

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
