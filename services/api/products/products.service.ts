import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  PRODUCTS,
  PRODUCTS_ALL,
  PRODUCTS_ALL_TENANT,
  PRODUCTS_BULK_DELETE,
  PRODUCTS_BULK_DELETE_TENANT,
  PRODUCTS_BULK_EDIT,
  PRODUCTS_BULK_EDIT_TENANT,
  PRODUCTS_BULK_QR_CODE,
  PRODUCTS_BULK_QR_CODE_TENANT,
  PRODUCTS_BULK_UPDATE,
  PRODUCTS_BULK_UPDATE_TENANT,
  PRODUCTS_TENANT,
  PRODUCTS_EXPORT_TENANT
} from '@/constants/api'
import { ProductBulkEditPayload, ProductBulkUpdatePayload, ProductPayload } from '@/types'

export default class ProductService {
  /** Product DataTable API */
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
        API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'products', queryParams ? `products?${queryParams}` : 'products'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Export Products API */
  static exportProducts = async (filterOptions: object = {}, exportType?: 'products' | 'stock') => {
    try {
      const queryParamsObj = { ...filterOptions } as Record<string, string>

      if (exportType) {
        queryParamsObj.export_type = exportType
      }

      const queryParams = new URLSearchParams(queryParamsObj).toString()

      const response = await handleRequest(API_URL + PRODUCTS_EXPORT_TENANT + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Create Product API */
  static store = async (payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['products', 'products-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Product API */
  static show = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `products/${productId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Product API */
  static update = async (productId: string, payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['products', 'products-all', `products/${productId}`]
      })

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

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_BULK_EDIT_TENANT : PRODUCTS_BULK_EDIT), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify({ changes: payload }),
        revalidateTags: ['products', 'products-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Update Products API
   *
   * @param {ProductBulkUpdatePayload} payload - Product bulk update payload
   * @returns Promise<any>
   */
  static bulkUpdate = async (payload: ProductBulkUpdatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCTS_BULK_UPDATE_TENANT : PRODUCTS_BULK_UPDATE),
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload),
          revalidateTags: ['products', 'products-all']
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
        API_URL + (isTenantApi ? PRODUCTS_BULK_QR_CODE_TENANT : PRODUCTS_BULK_QR_CODE),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload),
          revalidateTags: ['products', 'products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Product API */
  static destroy = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['products', 'products-all', `products/${productId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Bulk Delete Products API
   *
   * @param {string[]} ids - Array of product IDs to delete
   * @returns Promise<any>
   */
  static bulkDelete = async ({ ids }: { ids: string[] }) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCTS_BULK_DELETE_TENANT : PRODUCTS_BULK_DELETE),
        {
          requiresAuth: true,
          method: 'DELETE',
          body: JSON.stringify({ ids }),
          revalidateTags: ['products', 'products-all']
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Product API */
  static restore = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId + '/restore',
        {
          requiresAuth: true,
          method: 'POST',
          revalidateTags: ['products', 'products-all', `products/${productId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all products api */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCTS_ALL_TENANT : PRODUCTS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['login', 'products-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
