import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  API_URL,
  INTEREST_LEVELS,
  INTEREST_LEVELS_ALL,
  INTEREST_LEVELS_ALL_TENANT,
  INTEREST_LEVELS_TENANT
} from '@/constants/api'
import { InterestLevelPayload } from '@/types'


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
          next: { revalidate: 30, tags: ['login', 'interest-levels', queryParams ? `interest-levels?${queryParams}` : 'interest-levels'] }
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
        body: JSON.stringify(payload),
        revalidateTags: ['interest-levels', 'interest-levels-all']
      })

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
          next: { revalidate: 30, tags: ['login', `interest-levels/${interestLevelId}`] }
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
          body: JSON.stringify(payload),
          revalidateTags: ['interest-levels', 'interest-levels-all', `interest-levels/${interestLevelId}`]
        }
      )

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
          method: 'DELETE',
          revalidateTags: ['interest-levels', 'interest-levels-all', `interest-levels/${interestLevelId}`]
        }
      )

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
        next: { revalidate: 3600, tags: ['login', 'interest-levels-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
