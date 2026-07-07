import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { revalidate } from '@/services/app/cache.service'
import {
  API_URL,
  CLIENTS,
  CLIENTS_ALL,
  CLIENTS_ALL_TENANT,
  CLIENTS_LEAD_STAGE,
  CLIENTS_TENANT,
  CLIENTS_EXPORT,
  CLIENTS_EXPORT_TENANT
} from '@/constants/api'
import { ClientPayload } from '@/types'

export default class ClientService {
  /** Clients DataTable API */
  static index = async (filterOptions: object = {}, type: string = '') => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`clients${type ? `-${type}` : ''}`] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Export Clients API */
  static exportClients = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENTS_EXPORT_TENANT : CLIENTS_EXPORT) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Create Client API */
  static store = async (payload: ClientPayload, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      // Revalidate generic tags
      await revalidate('clients')
      await revalidate('clients-all')

      // Revalidate type-specific tags if type is provided
      if (type) {
        await revalidate(`clients-${type}`)
        await revalidate(`clients-all-${type}`)
      }

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Client API */
  static show = async (clientId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`clients/${clientId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Client API */
  static update = async (clientId: string, payload: ClientPayload, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      // Revalidate generic tags
      await revalidate('clients')
      await revalidate('clients-all')
      await revalidate(`clients/${clientId}`)

      // Revalidate type-specific tags if type is provided
      if (type) {
        await revalidate(`clients-${type}`)
        await revalidate(`clients-all-${type}`)
      }

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Client Lead Stage API */
  static updateLeadStage = async (
    clientId: string,
    stage: 'prospect' | 'open' | 'working' | 'meeting-set' | 'opportunity' | 'closed-won' | 'closed-lost'
  ) => {
    try {
      const response = await handleRequest(API_URL + CLIENTS_LEAD_STAGE(clientId, stage), {
        requiresAuth: true,
        method: 'PUT'
      })

      await revalidate('clients')
      await revalidate(`clients/${clientId}`)
      await revalidate('clients-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Client API */
  static destroy = async (clientId: string, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate(`clients${type ? `-${type}` : ''}`)
      await revalidate(`clients/${clientId}`)
      await revalidate(`clients-all${type ? `-${type}` : ''}`)
      await revalidate('clients-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Client API */
  static restore = async (clientId: string, type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? CLIENTS_TENANT : CLIENTS) + clientId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

      await revalidate(`clients${type ? `-${type}` : ''}`)
      await revalidate(`clients/${clientId}`)
      await revalidate(`clients-all${type ? `-${type}` : ''}`)
      await revalidate('clients-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all clients api */
  static getAll = async (type: string = '') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? CLIENTS_ALL_TENANT : CLIENTS_ALL) + (type ? `?type=${type}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          cache: 'no-store'

          // next: { revalidate: 3600, tags: [`clients-all${type ? `-${type}` : ''}`] } // Cache for 1 hour
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
