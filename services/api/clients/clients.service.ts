import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '@/services/app/cache.service'
import { CLIENTS, CLIENTS_ALL } from '@/constants/api'
import { ClientPayload } from '@/types'

export default class ClientService {
  /** Clients DataTable API */
  static index = async (filterOptions: object = {}, type: string = '') => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + CLIENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`clients${type ? `-${type}` : ''}`] }
      })

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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create client')
      }

      await revalidate(`clients${type ? `-${type}` : ''}`)
      await revalidate(`clients-all${type ? `-${type}` : ''}`)
      await revalidate('clients-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Client API */
  static show = async (clientId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS + clientId, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS + clientId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update client')
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

  /** Delete Client API */
  static destroy = async (clientId: string, type: string = '') => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS + clientId, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS + clientId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

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
  static getAllClients = async (type: string = '') => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + CLIENTS_ALL + (type ? `?type=${type}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: [`clients-all${type ? `-${type}` : ''}`] } // Cache for 1 hour
      })

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
