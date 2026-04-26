import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, PRODUCTS, PRODUCTS_ALL, PRODUCTS_ALL_TENANT, PRODUCTS_TENANT } from '@/constants/api'
import { ProductPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class ProductService {
  /** Product DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

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
