import { RolePermissionPayload } from '@/types'
import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, GET_ROLES, GET_ROLES_TENANT, ROLES, ROLES_TENANT } from '@/constants/api'
import { revalidate } from '../app/cache.service'

export default class RoleService {
  /**Roles DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ROLES_TENANT : ROLES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['roles'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? GET_ROLES_TENANT : GET_ROLES), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['roles-selection-list'] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Role API */
  static store = async (payload: RolePermissionPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ROLES_TENANT : ROLES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('roles')
      await revalidate('roles-selection-list')

      return response
    } catch (error) {
      throw error
    }
  }

  static show = async (roleId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ROLES_TENANT : ROLES) + roleId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`roles/${roleId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static update = async (roleId: string, payload: RolePermissionPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ROLES_TENANT : ROLES) + roleId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('roles')
      await revalidate(`roles/${roleId}`)
      await revalidate('roles-selection-list')

      return response
    } catch (error) {
      throw error
    }
  }

  static destroy = async (roleId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ROLES_TENANT : ROLES) + roleId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('roles')
      await revalidate(`roles/${roleId}`)
      await revalidate('roles-selection-list')

      return response
    } catch (error) {
      throw error
    }
  }
}
