import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  NON_INVENTORY_PRODUCTS,
  NON_INVENTORY_PRODUCTS_ALL,
  NON_INVENTORY_PRODUCTS_ALL_TENANT,
  NON_INVENTORY_PRODUCTS_BULK_DELETE,
  NON_INVENTORY_PRODUCTS_BULK_DELETE_TENANT,
  NON_INVENTORY_PRODUCTS_BULK_EDIT,
  NON_INVENTORY_PRODUCTS_BULK_EDIT_TENANT,
  NON_INVENTORY_PRODUCTS_BULK_QR_CODE,
  NON_INVENTORY_PRODUCTS_BULK_QR_CODE_TENANT,
  NON_INVENTORY_PRODUCTS_BULK_UPDATE_TENANT,
  NON_INVENTORY_PRODUCTS_TENANT,
  NON_INVENTORY_PRODUCTS_EXPORT_TENANT,
  NON_INVENTORY_PRODUCTS_BULK_UPDATE
} from '@/constants/api'
import { ProductBulkEditPayload, ProductBulkUpdatePayload, ProductPayload } from '@/types'

export default class NonInventoryProductService {
  /** Non-Inventory Product DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const params = new URLSearchParams()

      Object.entries(filterOptions as Record<string, any>).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, String(v)))
        } else if (value !== undefined && value !== null) {
          params.append(key, String(value))
        }
      })
      const queryParams = params.toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'non-inventory-products', queryParams ? `non-inventory-products?${queryParams}` : 'non-inventory-products'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Export Non-Inventory Products API */
  static exportProducts = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + NON_INVENTORY_PRODUCTS_EXPORT_TENANT + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Create Non-Inventory Product API */
  static store = async (payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Non-Inventory Product API */
  static show = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', `non-inventory-products/${productId}`] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Non-Inventory Product API */
  static update = async (productId: string, payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all', `non-inventory-products/${productId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Edit Products API
   *
   * @param {ProductBulkEditPayload[]} payload - Array of product objects to update
   * @returns Promise<any>
   */
  static bulkEdit = async (payload: ProductBulkEditPayload[]) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_BULK_EDIT_TENANT : NON_INVENTORY_PRODUCTS_BULK_EDIT),
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify({ changes: payload }),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Update Non Inventory Products API
   *
   * @param {ProductBulkUpdatePayload} payload - Product bulk update payload
   * @returns Promise<any>
   */
  static bulkUpdate = async (payload: ProductBulkUpdatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_BULK_UPDATE_TENANT : NON_INVENTORY_PRODUCTS_BULK_UPDATE),
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Generate QR Codes for Products API
   *
   * @param { { ids: string[] } } payload - Product bulk QR code payload
   * @returns Promise<any>
   */
  static bulkQrCode = async (payload: { ids: string[] }) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_BULK_QR_CODE_TENANT : NON_INVENTORY_PRODUCTS_BULK_QR_CODE),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Non-Inventory Product API */
  static destroy = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'DELETE',
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all', `non-inventory-products/${productId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Delete Non Inventory Products API
   *
   * @param {string[]} ids - Array of product IDs to delete
   * @returns Promise<any>
   */
  static bulkDelete = async ({ ids }: { ids: string[] }) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_BULK_DELETE_TENANT : NON_INVENTORY_PRODUCTS_BULK_DELETE),
        {
          requiresAuth: true,
          method: 'DELETE',
          body: JSON.stringify({ ids }),
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Non-Inventory Product API */
  static restore = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId + '/restore',
        {
          requiresAuth: true,
          method: 'POST',
          revalidateTags: ['non-inventory-products', 'non-inventory-products-all', `non-inventory-products/${productId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all non-inventory products API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_ALL_TENANT : NON_INVENTORY_PRODUCTS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['login', 'non-inventory-products-all'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
