import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, VENDOR_SALESMAN, VENDOR_SALESMAN_TENANT } from '@/constants/api'
import { VendorSalesmanPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorSalesmanService {
  /**Vendor Salesman DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_SALESMAN_TENANT : VENDOR_SALESMAN) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['vendor-salesman'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor Salesman API */
  static store = async (payload: VendorSalesmanPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDOR_SALESMAN_TENANT : VENDOR_SALESMAN), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('vendor-salesman')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Salesman API */
  static show = async (vendorSalesmanId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_SALESMAN_TENANT : VENDOR_SALESMAN) + vendorSalesmanId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`vendor-salesman/${vendorSalesmanId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Salesman API */
  static update = async (vendorSalesmanId: string, payload: VendorSalesmanPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_SALESMAN_TENANT : VENDOR_SALESMAN) + vendorSalesmanId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('vendor-salesman')
      await revalidate(`vendor-salesman/${vendorSalesmanId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Salesman API */
  static destroy = async (vendorSalesmanId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_SALESMAN_TENANT : VENDOR_SALESMAN) + vendorSalesmanId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('vendor-salesman')
      await revalidate(`vendor-salesman/${vendorSalesmanId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
