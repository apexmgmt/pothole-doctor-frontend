import apiInterceptor from './api.interceptor'
import { API_URL, COURIERS, COURIERS_ALL } from '@/constants/api'
import { CourierPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class CourierService {
  /** Couriers DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + COURIERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['couriers'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch couriers')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Courier API */
  static store = async (payload: CourierPayload) => {
    try {
      const response = await apiInterceptor(API_URL + COURIERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create courier')
      }

      await revalidate('couriers')
      await revalidate('couriers-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Courier API */
  static show = async (courierId: string) => {
    try {
      const response = await apiInterceptor(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`couriers/${courierId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch courier details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Courier API */
  static update = async (courierId: string, payload: CourierPayload) => {
    try {
      const response = await apiInterceptor(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update courier')
      }

      await revalidate('couriers')
      await revalidate('couriers-all')
      await revalidate(`couriers/${courierId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Courier API */
  static destroy = async (courierId: string) => {
    try {
      const response = await apiInterceptor(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete courier')
      }

      await revalidate('couriers')
      await revalidate('couriers-all')
      await revalidate(`couriers/${courierId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static getAll = async () => {
    try {
      const response = await apiInterceptor(API_URL + COURIERS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['couriers-all'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch couriers')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
