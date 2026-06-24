import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import {
  API_URL,
  PRODUCTS,
  PRODUCTS_ALL,
  PRODUCTS_ALL_TENANT,
  PRODUCTS_BULK_DELETE,
  PRODUCTS_BULK_DELETE_TENANT,
  PRODUCTS_BULK_EDIT,
  PRODUCTS_BULK_EDIT_TENANT,
  PRODUCTS_TENANT
} from '@/constants/api'
import { ProductBulkEditPayload, ProductPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

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

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['products'] }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch products')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Product API */
  static store = async (payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('products')
      await revalidate('products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Product API */
  static show = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`products/${productId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch product details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Product API */
  static update = async (productId: string, payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('products')
      await revalidate(`products/${productId}`)
      await revalidate('products-all')

      return await response.json()
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

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_BULK_EDIT_TENANT : PRODUCTS_BULK_EDIT), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify({ changes: payload })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('products')
      await revalidate('products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Product API */
  static destroy = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete product')
      }

      await revalidate('products')
      await revalidate(`products/${productId}`)
      await revalidate('products-all')

      return await response.json()
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

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PRODUCTS_BULK_DELETE_TENANT : PRODUCTS_BULK_DELETE),
        {
          requiresAuth: true,
          method: 'DELETE',
          body: JSON.stringify({ ids })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete products')
      }

      await revalidate('products')
      await revalidate('products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Product API */
  static restore = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PRODUCTS_TENANT : PRODUCTS) + productId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore product')
      }

      await revalidate('products')
      await revalidate(`products/${productId}`)
      await revalidate('products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all products api */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_ALL_TENANT : PRODUCTS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['products-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch products')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
