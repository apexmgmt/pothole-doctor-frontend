import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, VENDOR_REBATE_CREDITS, VENDOR_REBATE_CREDITS_TENANT } from '@/constants/api'
import { VendorRebateCreditPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorRebateCreditService {
  /**Vendor Rebate Credit DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? VENDOR_REBATE_CREDITS_TENANT : VENDOR_REBATE_CREDITS) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['vendor-rebate-credits'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor Rebate Credit API */
  static store = async (payload: VendorRebateCreditPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_REBATE_CREDITS_TENANT : VENDOR_REBATE_CREDITS),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('vendor-rebate-credits')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Rebate Credit API */
  static show = async (vendorRebateCreditId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_REBATE_CREDITS_TENANT : VENDOR_REBATE_CREDITS) + vendorRebateCreditId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`vendor-rebate-credits/${vendorRebateCreditId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Rebate Credit API */
  static update = async (vendorRebateCreditId: string, payload: VendorRebateCreditPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_REBATE_CREDITS_TENANT : VENDOR_REBATE_CREDITS) + vendorRebateCreditId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('vendor-rebate-credits')
      await revalidate(`vendor-rebate-credits/${vendorRebateCreditId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Rebate Credit API */
  static destroy = async (vendorRebateCreditId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_REBATE_CREDITS_TENANT : VENDOR_REBATE_CREDITS) + vendorRebateCreditId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('vendor-rebate-credits')
      await revalidate(`vendor-rebate-credits/${vendorRebateCreditId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
