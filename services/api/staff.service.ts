import { StaffPayload } from '@/types'
import { isTenant } from '@/utils/utility'
import { API_URL, STAFFS, STAFFS_ALL, STAFFS_ALL_TENANT, STAFFS_TENANT } from '@/constants/api'
import apiInterceptor from './api.interceptor'
import { revalidate } from '../app/cache.service'

export default class StaffService {
  /**Staffs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['staffs'] } // Cache for 60 seconds
        } 
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch staffs')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Staff API */
  static store = async (payload: StaffPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('staffs')
      await revalidate('staffs-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (staffId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`staffs/${staffId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch staff details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static update = async (staffId: string, payload: StaffPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)
      await revalidate('staffs-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (staffId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STAFFS_TENANT : STAFFS) + staffId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete staff')
      }

      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)
      await revalidate('staffs-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? STAFFS_ALL_TENANT : STAFFS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['staffs-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch all staffs')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
