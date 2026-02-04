import { isTenant } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { API_URL, WAREHOUSES, WAREHOUSES_TENANT } from '@/constants/api'
import { WarehousePayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class WarehouseService {
  /**Warehouse DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['warehouses'] } // Cache for 60 seconds
        }
      )

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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
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
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
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
