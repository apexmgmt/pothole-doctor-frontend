import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '@/services/app/cache.service'
import { API_URL, CLIENTS, CLIENTS_ALL, CLIENTS_ALL_TENANT, CLIENTS_TENANT } from '@/constants/api'
import { ClientPayload } from '@/types'

export default class ClientService {
  /** Clients DataTable API */
  static index = async (filterOptions: object = {}, type: string = '') => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`clients${type ? `-${type}` : ''}`] }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch clients')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Client API */
  static store = async (payload: ClientPayload, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create client')
      }

      // Revalidate generic tags
      await revalidate('clients')
      await revalidate('clients-all')

      // Revalidate type-specific tags if type is provided
      if (type) {
        await revalidate(`clients-${type}`)
        await revalidate(`clients-all-${type}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Client API */
  static show = async (clientId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`clients/${clientId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch client details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Client API */
  static update = async (clientId: string, payload: ClientPayload, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update client')
      }

      // Revalidate generic tags
      await revalidate('clients')
      await revalidate('clients-all')
      await revalidate(`clients/${clientId}`)

      // Revalidate type-specific tags if type is provided
      if (type) {
        await revalidate(`clients-${type}`)
        await revalidate(`clients-all-${type}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Client API */
  static destroy = async (clientId: string, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete client')
      }

      await revalidate(`clients${type ? `-${type}` : ''}`)
      await revalidate(`clients/${clientId}`)
      await revalidate(`clients-all${type ? `-${type}` : ''}`)
      await revalidate('clients-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Client API */
  static restore = async (clientId: string, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore client')
      }

      await revalidate(`clients${type ? `-${type}` : ''}`)
      await revalidate(`clients/${clientId}`)
      await revalidate(`clients-all${type ? `-${type}` : ''}`)
      await revalidate('clients-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all clients api */
  static getAll = async (type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? CLIENTS_ALL_TENANT : CLIENTS_ALL) + (type ? `?type=${type}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          cache: 'no-store'

          // next: { revalidate: 3600, tags: [`clients-all${type ? `-${type}` : ''}`] } // Cache for 1 hour
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch clients')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
