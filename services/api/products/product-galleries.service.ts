import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, PRODUCTS_GALLERIES, PRODUCTS_GALLERIES_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'

export default class ProductGalleryService {
  static index = async (productId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PRODUCTS_GALLERIES_TENANT : PRODUCTS_GALLERIES) + `?product_id=${productId}`,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['product-galleries'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch product galleries')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static store = async (payload: any) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PRODUCTS_GALLERIES_TENANT : PRODUCTS_GALLERIES), {
        requiresAuth: true,
        method: 'POST',
        body: payload
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to add product gallery')
      }

      await revalidate('product-galleries')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  static destroy = async (galleryId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PRODUCTS_GALLERIES_TENANT : PRODUCTS_GALLERIES) + galleryId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete product gallery')
      }

      await revalidate('product-galleries')

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
