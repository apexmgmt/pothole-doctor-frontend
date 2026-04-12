import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import {
  API_URL,
  NON_INVENTORY_PRODUCTS,
  NON_INVENTORY_PRODUCTS_ALL,
  NON_INVENTORY_PRODUCTS_ALL_TENANT,
  NON_INVENTORY_PRODUCTS_TENANT
} from '@/constants/api'
import { ProductPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class NonInventoryProductService {
  /** Non-Inventory Product DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL +
          (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['non-inventory-products'] }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch non-inventory products')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Non-Inventory Product API */
  static store = async (payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('non-inventory-products')
      await revalidate('non-inventory-products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Non-Inventory Product API */
  static show = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`non-inventory-products/${productId}`] }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch non-inventory product details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Non-Inventory Product API */
  static update = async (productId: string, payload: ProductPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('non-inventory-products')
      await revalidate(`non-inventory-products/${productId}`)
      await revalidate('non-inventory-products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Non-Inventory Product API */
  static destroy = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete non-inventory product')
      }

      await revalidate('non-inventory-products')
      await revalidate(`non-inventory-products/${productId}`)
      await revalidate('non-inventory-products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Non-Inventory Product API */
  static restore = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_TENANT : NON_INVENTORY_PRODUCTS) + productId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore non-inventory product')
      }

      await revalidate('non-inventory-products')
      await revalidate(`non-inventory-products/${productId}`)
      await revalidate('non-inventory-products-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all non-inventory products API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? NON_INVENTORY_PRODUCTS_ALL_TENANT : NON_INVENTORY_PRODUCTS_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['non-inventory-products-all'] }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch non-inventory products')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
