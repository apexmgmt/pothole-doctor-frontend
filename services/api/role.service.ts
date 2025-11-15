import { RolePermissionPayload } from '@/types'
import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { GET_ROLES, ROLES } from '@/constants/api'
import { revalidate } from '../app/cache.service'

export default class RoleService {
  /**Roles DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + ROLES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['roles'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch roles')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getAllRoles = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + GET_ROLES, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['roles-selection-list'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch roles')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Role API */
  static store = async (payload: RolePermissionPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + ROLES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create role')
      }

      await revalidate('roles')
      await revalidate('roles-selection-list')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (roleId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + ROLES + roleId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`roles/${roleId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch role details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static update = async (roleId: string, payload: RolePermissionPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + ROLES + roleId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update role')
      }
      await revalidate('roles')
      await revalidate(`roles/${roleId}`)
      await revalidate('roles-selection-list')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (roleId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + ROLES + roleId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete role')
      }
      await revalidate('roles')
      await revalidate(`roles/${roleId}`)
      await revalidate('roles-selection-list')
      
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
