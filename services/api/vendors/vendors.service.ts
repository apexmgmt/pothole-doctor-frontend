import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, VENDORS, VENDORS_ALL, VENDORS_ALL_TENANT, VENDORS_TENANT } from '@/constants/api'
import { VendorPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class VendorService {
  /** Vendor DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['vendors'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendors')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Vendor API */
  static store = async (payload: VendorPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create vendor')
      }

      await revalidate('vendors')
      await revalidate('vendors-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor API */
  static show = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`vendors/${vendorId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendor details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor API */
  static update = async (vendorId: string, payload: VendorPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update vendor')
      }

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor API */
  static destroy = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete vendor')
      }

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Vendor API */
  static restore = async (vendorId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_TENANT : VENDORS) + vendorId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore vendor')
      }

      await revalidate('vendors')
      await revalidate(`vendors/${vendorId}`)
      await revalidate('vendors-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all vendors api */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? VENDORS_ALL_TENANT : VENDORS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['vendors-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendors')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
