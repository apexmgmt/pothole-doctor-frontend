import { handleRequest } from '@/services/api/base.service'
import { API_URL, COURIERS, COURIERS_ALL } from '@/constants/api'
import { CourierPayload } from '@/types'


export default class CourierService {
  /** Couriers DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + COURIERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'couriers', queryParams ? `couriers?${queryParams}` : 'couriers'] }
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
        body: JSON.stringify(payload),
        revalidateTags: ['couriers', 'couriers-all']
      })

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
        next: { revalidate: 30, tags: ['login', `couriers/${courierId}`] }
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
        body: JSON.stringify(payload),
        revalidateTags: ['couriers', 'couriers-all', `couriers/${courierId}`]
      })

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
        method: 'DELETE',
        revalidateTags: ['couriers', 'couriers-all', `couriers/${courierId}`]
      })

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
        next: { revalidate: 3600, tags: ['login', 'couriers-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
