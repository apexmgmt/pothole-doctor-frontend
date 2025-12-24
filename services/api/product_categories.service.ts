import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORIES_ALL } from '@/constants/api'
import { ProductCategoryPayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class ProductCategoryService {
  /**Product Category DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['product-categories'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch product categories')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Product Category API */
  static store = async (payload: ProductCategoryPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create product category')
      }

      await revalidate('product-categories')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Product Category API */
  static show = async (productCategoryId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES + productCategoryId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`product-categories/${productCategoryId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch product category details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Product Category API */
  static update = async (productCategoryId: string, payload: ProductCategoryPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES + productCategoryId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update product category')
      }

      await revalidate('product-categories')
      await revalidate(`product-categories/${productCategoryId}`)
      await revalidate('product-categories-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Product Category API */
  static destroy = async (productCategoryId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES + productCategoryId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete product category')
      }

      await revalidate('product-categories')
      await revalidate(`product-categories/${productCategoryId}`)
      await revalidate('product-categories-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all product categories API */
  static getAllProductCategories = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PRODUCT_CATEGORIES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['product-categories-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch product categories')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
