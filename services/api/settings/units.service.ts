import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, UNITS, UNITS_ALL, UNITS_ALL_TENANT, UNITS_TENANT } from '@/constants/api'
import { UnitPayload } from '@/types'

export default class UnitService {
  /**Units DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? UNITS_TENANT : UNITS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'units', queryParams ? `units?${queryParams}` : 'units'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Units API */
  static store = async (payload: UnitPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? UNITS_TENANT : UNITS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['units', 'units-all', 'units-all-uom', 'units-all-measure']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Units API */
  static show = async (unitId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? UNITS_TENANT : UNITS) + unitId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `units/${unitId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Units API */
  static update = async (unitId: string, payload: UnitPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? UNITS_TENANT : UNITS) + unitId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['units', 'units-all', 'units-all-uom', 'units-all-measure', `units/${unitId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Unit API */
  static destroy = async (unitId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? UNITS_TENANT : UNITS) + unitId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['units', 'units-all', 'units-all-uom', 'units-all-measure', `units/${unitId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all Units API */
  static getAll = async (group?: string | 'uom' | 'measure') => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? UNITS_ALL_TENANT : UNITS_ALL) + (group ? `?group=${group}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'units-all' + (group ? `-${group}` : '')] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }
}
