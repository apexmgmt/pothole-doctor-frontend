import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, VENDOR_PICKUP_ADDRESSES, VENDOR_PICKUP_ADDRESSES_TENANT } from '@/constants/api'
import { VendorPickupAddressPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class VendorPickupAddressService {
  /**Vendor Pickup Address DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL +
          (isTenantApi ? VENDOR_PICKUP_ADDRESSES_TENANT : VENDOR_PICKUP_ADDRESSES) +
          (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['vendor-pickup-addresses'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Vendor Pickup Address API */
  static store = async (payload: VendorPickupAddressPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_PICKUP_ADDRESSES_TENANT : VENDOR_PICKUP_ADDRESSES),
        {
          requiresAuth: true,
          method: 'POST',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('vendor-pickup-addresses')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Vendor Pickup Address API */
  static show = async (vendorPickupAddressId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_PICKUP_ADDRESSES_TENANT : VENDOR_PICKUP_ADDRESSES) + vendorPickupAddressId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`vendor-pickup-addresses/${vendorPickupAddressId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Vendor Pickup Address API */
  static update = async (vendorPickupAddressId: string, payload: VendorPickupAddressPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_PICKUP_ADDRESSES_TENANT : VENDOR_PICKUP_ADDRESSES) + vendorPickupAddressId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('vendor-pickup-addresses')
      await revalidate(`vendor-pickup-addresses/${vendorPickupAddressId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Vendor Pickup Address API */
  static destroy = async (vendorPickupAddressId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? VENDOR_PICKUP_ADDRESSES_TENANT : VENDOR_PICKUP_ADDRESSES) + vendorPickupAddressId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('vendor-pickup-addresses')
      await revalidate(`vendor-pickup-addresses/${vendorPickupAddressId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
