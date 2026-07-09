import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, WAREHOUSES, WAREHOUSES_ALL, WAREHOUSES_ALL_TENANT, WAREHOUSES_TENANT } from '@/constants/api'
import { WarehousePayload } from '@/types'

export default class WarehouseService {
  /**Warehouse DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'warehouses', queryParams ? `warehouses?${queryParams}` : 'warehouses'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Warehouse API */
  static store = async (payload: WarehousePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['warehouses', 'warehouses-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Warehouse API */
  static show = async (warehouseId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `warehouses/${warehouseId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Warehouse API */
  static update = async (warehouseId: string, payload: WarehousePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['warehouses', 'warehouses-all', `warehouses/${warehouseId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Warehouse API */
  static destroy = async (warehouseId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? WAREHOUSES_TENANT : WAREHOUSES) + warehouseId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['warehouses', 'warehouses-all', `warehouses/${warehouseId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Get All Warehouses API - This endpoint is used to fetch all warehouses without pagination, primarily for dropdowns and selection lists. It is cached for 5 minutes to optimize performance while ensuring reasonably fresh data.
   */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? WAREHOUSES_ALL_TENANT : WAREHOUSES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', 'warehouses-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
