import { handleRequest } from '@/services/api/base.service'
import { API_URL, COURIERS, COURIERS_ALL } from '@/constants/api'
import { CourierPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class CourierService {
  /** Couriers DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + COURIERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['couriers'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Courier API */
  static store = async (payload: CourierPayload) => {
    try {
      const response = await handleRequest(API_URL + COURIERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('couriers')
      await revalidate('couriers-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Courier API */
  static show = async (courierId: string) => {
    try {
      const response = await handleRequest(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`couriers/${courierId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Courier API */
  static update = async (courierId: string, payload: CourierPayload) => {
    try {
      const response = await handleRequest(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('couriers')
      await revalidate('couriers-all')
      await revalidate(`couriers/${courierId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Courier API */
  static destroy = async (courierId: string) => {
    try {
      const response = await handleRequest(API_URL + COURIERS + courierId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('couriers')
      await revalidate('couriers-all')
      await revalidate(`couriers/${courierId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  static getAll = async () => {
    try {
      const response = await handleRequest(API_URL + COURIERS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['couriers-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
