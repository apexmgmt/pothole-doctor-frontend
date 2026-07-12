import { StatePayload } from '@/types'
import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, STATES, STATES_TENANT } from '@/constants/api'
import { revalidate } from '../../app/cache.service'

export default class StateService {
  /**States DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? STATES_TENANT : STATES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['states'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create State API */
  static store = async (payload: StatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STATES_TENANT : STATES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('states')
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }

  static show = async (stateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`states/${stateId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static update = async (stateId: string, payload: StatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('states')
      await revalidate(`states/${stateId}`)
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }

  static destroy = async (stateId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STATES_TENANT : STATES) + stateId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('states')
      await revalidate(`states/${stateId}`)
      await revalidate('locations')

      return response
    } catch (error) {
      throw error
    }
  }
}
