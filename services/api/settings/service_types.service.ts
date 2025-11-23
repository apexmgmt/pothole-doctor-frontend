import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PAYMENT_TERMS, PAYMENT_TERMS_TYPES, SERVICE_TYPES, SERVICE_TYPES_ALL } from '@/constants/api'
import { PaymentTermPayload, ServiceTypePayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class ServiceTypeService {
  /**Service Types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['service-types'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch service types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Service Types API */
  static store = async (payload: ServiceTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create service types')
      }

      await revalidate('service-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Service Type API */
  static show = async (serviceTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES + serviceTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`service-types/${serviceTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch service types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Service Types API */
  static update = async (serviceTypeId: string, payload: ServiceTypePayload) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES + serviceTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update service types')
      }
      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Service Types API */
  static destroy = async (serviceTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES + serviceTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete service types')
      }
      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Service Types API */
  static restore = async (serviceTypeId: string) => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES + serviceTypeId + '/restore', {
        requiresAuth: true,
        method: 'POST'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to restore service types')
      }
      await revalidate('service-types')
      await revalidate(`service-types/${serviceTypeId}`)
      await revalidate('service-types-all')
      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get All Service Types API */
  static getServiceTypeTypes = async () => {
    try {
      const apiUrl: string = await getApiUrl()
      const response = await apiInterceptor(apiUrl + SERVICE_TYPES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['service-type-types'] } // Cache for 1 hour
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch service type types')
      }
      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
