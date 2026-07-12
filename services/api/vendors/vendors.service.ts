import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, VENDORS, VENDORS_ALL, VENDORS_ALL_TENANT, VENDORS_TENANT } from '@/constants/api'
import { VendorPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class VendorService {
  /** Vendor DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['vendors'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Vendor API */
  static store = async (payload: VendorPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('vendors')
      await revalidate('vendors-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor API */
  static show = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`vendors/${vendorId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor API */
  static update = async (vendorId: string, payload: VendorPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor API */
  static destroy = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Vendor API */
  static restore = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all vendors api */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? VENDORS_ALL_TENANT : VENDORS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['vendors-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
