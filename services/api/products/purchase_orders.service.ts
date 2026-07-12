import { API_URL, PURCHASE_ORDERS, PURCHASE_ORDERS_SHIPMENT, EXPORT_PURCHASE_ORDERS } from '@/constants/api'
import { PurchaseOrderPayload, PurchaseOrderShipmentPayload } from '@/types'
import { handleRequest } from '@/services/api/base.service'

export default class PurchaseOrderService {
  /**
   * Purchase Orders DataTable API
   * In filterOptions may have vendor_id, status, warehouse_id etc for filtering purchase orders
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + PURCHASE_ORDERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'purchase-orders', queryParams ? `purchase-orders?${queryParams}` : 'purchase-orders'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Export Purchase Orders
   * Returns an Excel file Blob
   */
  static exportPurchaseOrders = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + EXPORT_PURCHASE_ORDERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Create Purchase Order API */
  static store = async (payload: PurchaseOrderPayload) => {
    try {
      const response = await handleRequest(API_URL + PURCHASE_ORDERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['purchase-orders']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Purchase Order API */
  static show = async (purchaseOrderId: string) => {
    try {
      const response = await handleRequest(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `purchase-orders/${purchaseOrderId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Purchase Order API */
  static update = async (purchaseOrderId: string, payload: PurchaseOrderPayload) => {
    try {
      const response = await handleRequest(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['purchase-orders', `purchase-orders/${purchaseOrderId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Purchase Order API */
  static destroy = async (purchaseOrderId: string) => {
    try {
      const response = await handleRequest(API_URL + PURCHASE_ORDERS + purchaseOrderId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['purchase-orders', `purchase-orders/${purchaseOrderId}`]
      })

      return response
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
      const response = await handleRequest(API_URL + PURCHASE_ORDERS_SHIPMENT(purchaseOrderId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['purchase-orders', `purchase-orders/${purchaseOrderId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
