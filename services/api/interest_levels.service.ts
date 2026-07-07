import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  INTEREST_LEVELS,
  INTEREST_LEVELS_ALL,
  INTEREST_LEVELS_ALL_TENANT,
  INTEREST_LEVELS_TENANT
} from '@/constants/api'
import { InterestLevelPayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class InterestLevelService {
  /**Interest levels DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? INTEREST_LEVELS_TENANT : INTEREST_LEVELS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['interest-levels'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Interest Level API */
  static store = async (payload: InterestLevelPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? INTEREST_LEVELS_TENANT : INTEREST_LEVELS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('interest-levels')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Interest Level API */
  static show = async (interestLevelId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? INTEREST_LEVELS_TENANT : INTEREST_LEVELS) + interestLevelId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`interest-levels/${interestLevelId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Interest Level API */
  static update = async (interestLevelId: string, payload: InterestLevelPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? INTEREST_LEVELS_TENANT : INTEREST_LEVELS) + interestLevelId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('interest-levels')
      await revalidate(`interest-levels/${interestLevelId}`)
      await revalidate('interest-levels-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Interest Level API */
  static destroy = async (interestLevelId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? INTEREST_LEVELS_TENANT : INTEREST_LEVELS) + interestLevelId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('interest-levels')
      await revalidate(`interest-levels/${interestLevelId}`)
      await revalidate('interest-levels-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Interest Levels API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? INTEREST_LEVELS_ALL_TENANT : INTEREST_LEVELS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['interest-levels-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
