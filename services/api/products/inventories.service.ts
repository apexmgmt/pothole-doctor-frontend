import { API_URL, INVENTORIES, INVENTORY_ADJUST } from '@/constants/api'
import { InventoryAdjustPayload, InventoryPayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '../../app/cache.service'

export default class InventoryService {
  /**
   * Inventories DataTable API
   * In filterOptions may have product_id, vendor_id, status etc for filtering inventories
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + INVENTORIES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['inventories'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch inventories')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Inventory API */
  static store = async (payload: InventoryPayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORIES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('inventories')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Inventory API */
  static show = async (inventoryId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORIES + inventoryId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`inventories/${inventoryId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch inventory details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Inventory API */
  static update = async (inventoryId: string, payload: InventoryPayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORIES + inventoryId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('inventories')
      await revalidate(`inventories/${inventoryId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Inventory API */
  static destroy = async (inventoryId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORIES + inventoryId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete inventory')
      }

      await revalidate('inventories')
      await revalidate(`inventories/${inventoryId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Adjust Inventory API */
  static adjust = async (inventoryId: string, payload: InventoryAdjustPayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORY_ADJUST(inventoryId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('inventories')
      await revalidate(`inventories/${inventoryId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
