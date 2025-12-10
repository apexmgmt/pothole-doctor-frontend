import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { VENDOR_REBATE_CREDITS } from '@/constants/api'
import { VendorRebateCreditPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorRebateCreditService {
  /**Vendor Rebate Credit DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + VENDOR_REBATE_CREDITS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['vendor-rebate-credits'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch vendor rebate credits')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor Rebate Credit API */
  static store = async (payload: VendorRebateCreditPayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + VENDOR_REBATE_CREDITS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add rebate credit')
      }

      await revalidate('vendor-rebate-credits')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Rebate Credit API */
  static show = async (vendorRebateCreditId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + VENDOR_REBATE_CREDITS + vendorRebateCreditId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`vendor-rebate-credits/${vendorRebateCreditId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch rebate credit details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Rebate Credit API */
  static update = async (vendorRebateCreditId: string, payload: VendorRebateCreditPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_REBATE_CREDITS + vendorRebateCreditId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update rebate credit')
      }
      await revalidate('vendor-rebate-credits')
      await revalidate(`vendor-rebate-credits/${vendorRebateCreditId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Rebate Credit API */
  static destroy = async (vendorRebateCreditId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + VENDOR_REBATE_CREDITS + vendorRebateCreditId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete rebate credit')
      }
      await revalidate('vendor-rebate-credits')
      await revalidate(`vendor-rebate-credits/${vendorRebateCreditId}`)
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
