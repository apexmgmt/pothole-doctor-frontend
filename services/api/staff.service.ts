import { StaffPayload } from '@/types'
import { isTenant } from '@/utils/utility'
import {
  API_URL,
  STAFF_CHANGE_PASSWORD,
  STAFF_CHANGE_PASSWORD_TENANT,
  STAFFS,
  STAFFS_ALL,
  STAFFS_ALL_TENANT,
  STAFFS_TENANT
} from '@/constants/api'
import { handleRequest } from '@/services/api/base.service'
import { revalidate } from '../app/cache.service'

export default class StaffService {
  /**Staffs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['staffs'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Staff API */
  static store = async (payload: StaffPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('staffs')
      await revalidate('staffs-all')

      return response
    } catch (error) {
      throw error
    }
  }

  static show = async (staffId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`staffs/${staffId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static update = async (staffId: string, payload: StaffPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)
      await revalidate('staffs-all')

      return response
    } catch (error) {
      throw error
    }
  }

  static destroy = async (staffId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)
      await revalidate('staffs-all')

      return response
    } catch (error) {
      throw error
    }
  }

  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? STAFFS_ALL_TENANT : STAFFS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['staffs-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static changePassword = async (staffId: string, password: string, password_confirmation: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? STAFF_CHANGE_PASSWORD_TENANT : STAFF_CHANGE_PASSWORD) + staffId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify({ password, password_confirmation })
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
