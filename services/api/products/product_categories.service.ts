import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORIES_ALL,
  PRODUCT_CATEGORIES_ALL_TENANT,
  PRODUCT_CATEGORIES_TENANT
} from '@/constants/api'
import { ProductCategoryPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class ProductCategoryService {
  /**Product Category DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? PRODUCT_CATEGORIES_TENANT : PRODUCT_CATEGORIES) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['product-categories'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Product Category API */
  static store = async (payload: ProductCategoryPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? PRODUCT_CATEGORIES_TENANT : PRODUCT_CATEGORIES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('product-categories')
      await revalidate('product-categories-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Product Category API */
  static show = async (productCategoryId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCT_CATEGORIES_TENANT : PRODUCT_CATEGORIES) + productCategoryId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`product-categories/${productCategoryId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Product Category API */
  static update = async (productCategoryId: string, payload: ProductCategoryPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCT_CATEGORIES_TENANT : PRODUCT_CATEGORIES) + productCategoryId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('product-categories')
      await revalidate(`product-categories/${productCategoryId}`)
      await revalidate('product-categories-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Product Category API */
  static destroy = async (productCategoryId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCT_CATEGORIES_TENANT : PRODUCT_CATEGORIES) + productCategoryId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('product-categories')
      await revalidate(`product-categories/${productCategoryId}`)
      await revalidate('product-categories-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all product categories API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? PRODUCT_CATEGORIES_ALL_TENANT : PRODUCT_CATEGORIES_ALL),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 3600, tags: ['product-categories-all'] } // Cache for 1 hour
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
