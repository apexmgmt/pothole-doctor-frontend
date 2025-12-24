import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { WAREHOUSES } from '@/constants/api'
import { WarehousePayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class WarehouseService {
  /**Warehouse DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + WAREHOUSES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['warehouses'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch warehouses')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Warehouse API */
  static store = async (payload: WarehousePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + WAREHOUSES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create warehouse')
      }

      await revalidate('warehouses')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Warehouse API */
  static show = async (warehouseId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + WAREHOUSES + warehouseId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`warehouses/${warehouseId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch warehouse details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Warehouse API */
  static update = async (warehouseId: string, payload: WarehousePayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + WAREHOUSES + warehouseId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update warehouse')
      }

      await revalidate('warehouses')
      await revalidate(`warehouses/${warehouseId}`)
      await revalidate('warehouses-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Warehouse API */
  static destroy = async (warehouseId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + WAREHOUSES + warehouseId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete warehouse')
      }

      await revalidate('warehouses')
      await revalidate(`warehouses/${warehouseId}`)
      await revalidate('warehouses-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
