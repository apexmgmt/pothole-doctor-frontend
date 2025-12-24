import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { VENDOR_SALESMAN } from '@/constants/api'
import { VendorSalesmanPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorSalesmanService {
  /**Vendor Salesman DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + VENDOR_SALESMAN + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['vendor-salesman'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendor salesman')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor Salesman API */
  static store = async (payload: VendorSalesmanPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_SALESMAN, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to add vendor salesman')
      }

      await revalidate('vendor-salesman')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Salesman API */
  static show = async (vendorSalesmanId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_SALESMAN + vendorSalesmanId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`vendor-salesman/${vendorSalesmanId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch vendor salesman details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Salesman API */
  static update = async (vendorSalesmanId: string, payload: VendorSalesmanPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_SALESMAN + vendorSalesmanId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update vendor salesman')
      }

      await revalidate('vendor-salesman')
      await revalidate(`vendor-salesman/${vendorSalesmanId}`)
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Salesman API */
  static destroy = async (vendorSalesmanId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + VENDOR_SALESMAN + vendorSalesmanId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete vendor salesman')
      }

      await revalidate('vendor-salesman')
      await revalidate(`vendor-salesman/${vendorSalesmanId}`)
      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
