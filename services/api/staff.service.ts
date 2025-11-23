import { StaffPayload } from '@/types'
import { getApiUrl } from '@/utils/utility'
import { STAFFS } from '@/constants/api'
import apiInterceptor from './api.interceptor'
import { revalidate } from '../app/cache.service'

export default class StaffService {
  /**Staffs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + STAFFS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['staffs'] } // Cache for 60 seconds
      })

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
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + STAFFS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create staff')
      }

      await revalidate('staffs')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static show = async (staffId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + STAFFS + staffId, {
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
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + STAFFS + staffId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update staff')
      }
      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (staffId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + STAFFS + staffId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete staff')
      }
      await revalidate('staffs')
      await revalidate(`staffs/${staffId}`)
      
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
