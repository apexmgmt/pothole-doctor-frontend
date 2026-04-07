import { API_URL, INVENTORIES, INVENTORY_ADJUST, INVENTORY_ADJUSTMENTS } from '@/constants/api'
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

  /**
   * Inventory Adjustments API
   * filterOptions should have purchase_order_id for listing adjustment for a specific inventory
   */
  static getAdjustments = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + INVENTORY_ADJUSTMENTS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['inventory-adjustments'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch inventory adjustments')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Inventory Adjustment Details API
   * @param adjustmentId Inventory Adjustment ID
   * @returns Inventory Adjustment details
   * Method: GET
   */
  static getAdjustmentDetails = async (adjustmentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORY_ADJUSTMENTS + adjustmentId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`inventory-adjustments/${adjustmentId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch inventory adjustment details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static createAdjustmentForInventory = async (purchaseOrderId: string, payload: InventoryAdjustPayload) => {
    try {
      const response = await apiInterceptor(API_URL + INVENTORY_ADJUSTMENTS + purchaseOrderId, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('inventory-adjustments')
      await revalidate(`purchase-orders/${purchaseOrderId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
