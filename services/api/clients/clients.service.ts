import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
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
          next: {
            revalidate: 30,
            tags: [
              'login',
              'clients',
              `clients${type ? `-${type}` : ''}`,
              queryParams ? `clients${type ? `-${type}` : ''}?${queryParams}` : `clients${type ? `-${type}` : ''}`
            ]
          }
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
        body: JSON.stringify(payload),
        revalidateTags: ['clients', 'clients-all', type ? `clients-${type}` : '', type ? `clients-all-${type}` : ''].filter(Boolean)
      })

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
        next: { revalidate: 30, tags: ['login', `clients/${clientId}`] }
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
        body: JSON.stringify(payload),
        revalidateTags: ['clients', 'clients-all', `clients/${clientId}`, type ? `clients-${type}` : '', type ? `clients-all-${type}` : ''].filter(Boolean)
      })

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
        method: 'PUT',
        revalidateTags: ['clients', `clients/${clientId}`, 'clients-all']
      })

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
        method: 'DELETE',
        revalidateTags: ['clients', 'clients-all', `clients/${clientId}`, `clients${type ? `-${type}` : ''}`, `clients-all${type ? `-${type}` : ''}`]
      })

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
        method: 'POST',
        revalidateTags: ['clients', 'clients-all', `clients/${clientId}`, `clients${type ? `-${type}` : ''}`, `clients-all${type ? `-${type}` : ''}`]
      })

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
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
