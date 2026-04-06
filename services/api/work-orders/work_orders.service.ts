import {
  API_URL,
  COMPLETE_WORK_ORDER,
  VIEW_WORK_ORDER,
  WORK_ORDERS,
  WORK_ORDERS_RESTORE,
  WORK_ORDERS_SERVICES
} from '@/constants/api'
import apiInterceptor from '../api.interceptor'
import { CompletionCertificatePayload, WorkOrderPayload, WorkOrderServicePayload } from '@/types'

export default class WorkOrderService {
  /**
   * Fetches a list of work orders based on the provided filter options.
   *
   * @param filterOptions An object containing key-value pairs for filtering the work orders.
   * @returns A promise that resolves to the list of work orders matching the filter criteria.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static index = async (filterOptions: object) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + WORK_ORDERS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['work_orders'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch invoices')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Creates a new work order with the provided payload. (Step 1 like estimate creation)
   */
  static store = async (payload: WorkOrderPayload) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Adds a service to an existing work order.
   * @param workOrderId The ID of the work order to which the service will be added.
   * @param payload The payload containing the service details.
   * @returns A promise that resolves to the added service data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static storeServices = async (workOrderId: string, payload: WorkOrderServicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS_SERVICES(workOrderId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetches the details of a specific work order by its ID.
   *
   * @param workOrderId The ID of the work order to be fetched.
   * @returns A promise that resolves to the work order data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static show = async (workOrderId: string) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS + workOrderId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch work order')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates an existing work order with the provided payload.
   *
   * @param workOrderId The ID of the work order to be updated.
   * @param payload An object containing the updated work order data.
   * @returns A promise that resolves to the updated work order data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static update = async (workOrderId: string, payload: WorkOrderPayload) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS + workOrderId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates the services of an existing work order with the provided payload.
   *
   * @param workOrderId The ID of the work order whose services will be updated.
   * @param payload An object containing the updated services data.
   * @returns A promise that resolves to the updated services data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static updateServices = async (workOrderId: string, payload: WorkOrderServicePayload) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS_SERVICES(workOrderId), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Deletes an existing work order by its ID.
   *
   * @param workOrderId The ID of the work order to be deleted.
   * @returns A promise that resolves to the deletion response if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static destroy = async (workOrderId: string) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS + workOrderId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete work order')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Restores a deleted work order by its ID.
   *
   * @param workOrderId The ID of the work order to be restored.
   * @returns A promise that resolves to the restored work order data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static restore = async (workOrderId: string) => {
    try {
      const response = await apiInterceptor(API_URL + WORK_ORDERS_RESTORE(workOrderId), {
        requiresAuth: true,
        method: 'PUT'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore work order')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * View work order details for completion certificate
   * @param wo_id The ID of the work order to be viewed.
   * @param sg_id The ID of the service group associated with the work order.
   * @param st_id The ID of the service type associated with the work order.
   * @returns A promise {status: 'success' | 'error, data: {work_order: WorkOrder, service: Service, completion_certificate: CompletionCertificate} | null}
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static viewWorkOrder = async (wo_id: string, sg_id: string, st_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + VIEW_WORK_ORDER(wo_id, sg_id, st_id), {
        requiresAuth: false,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to view work order')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Submits a completion certificate for a work order with a signed PDF.
   * @param payload CompletionCertificatePayload containing wo_id, st_id, file (signed PDF), and is_completed flag.
   * @returns A promise resolving to the updated completion certificate data.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static completeWorkOrder = async (payload: CompletionCertificatePayload) => {
    try {
      const response = await apiInterceptor(API_URL + COMPLETE_WORK_ORDER, {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to submit completion certificate')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
