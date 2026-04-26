import { API_URL, PURCHASE_ORDERS, PURCHASE_ORDERS_SHIPMENT } from '@/constants/api'
import { PurchaseOrderPayload, PurchaseOrderShipmentPayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { revalidate } from '../../app/cache.service'

export default class PurchaseOrderService {
  /**
   * Purchase Orders DataTable API
   * In filterOptions may have vendor_id, status, warehouse_id etc for filtering purchase orders
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['purchase-orders'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch purchase orders')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Purchase Order API */
  static store = async (payload: PurchaseOrderPayload) => {
    try {
      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('purchase-orders')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Purchase Order API */
  static show = async (purchaseOrderId: string) => {
    try {
      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`purchase-orders/${purchaseOrderId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch purchase order details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Purchase Order API */
  static update = async (purchaseOrderId: string, payload: PurchaseOrderPayload) => {
    try {
      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('purchase-orders')
      await revalidate(`purchase-orders/${purchaseOrderId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Purchase Order API */
  static destroy = async (purchaseOrderId: string) => {
    try {
      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete purchase order')
      }

      await revalidate('purchase-orders')
      await revalidate(`purchase-orders/${purchaseOrderId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Create Shipment for Purchase Order API
   * This will create a shipment for the given purchase order and update the purchase order status to 'ordered'
   * It will also update the inventory for the products in the purchase order for moved to inventory
   */
  static shipment = async (purchaseOrderId: string, payload: PurchaseOrderShipmentPayload) => {
    try {
      const response = await apiInterceptor(API_URL + PURCHASE_ORDERS_SHIPMENT(purchaseOrderId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('purchase-orders')
      await revalidate(`purchase-orders/${purchaseOrderId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
