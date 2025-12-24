import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { INTEREST_LEVELS, INTEREST_LEVELS_ALL } from '@/constants/api'
import { InterestLevelPayload } from '@/types'
import { revalidate } from '../app/cache.service'

export default class InterestLevelService {
  /**Interest levels DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['interest-levels'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch interest levels')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Interest Level API */
  static store = async (payload: InterestLevelPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create interest level')
      }

      await revalidate('interest-levels')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Interest Level API */
  static show = async (interestLevelId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS + interestLevelId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`interest-levels/${interestLevelId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch interest level details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Interest Level API */
  static update = async (interestLevelId: string, payload: InterestLevelPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS + interestLevelId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update interest level')
      }

      await revalidate('interest-levels')
      await revalidate(`interest-levels/${interestLevelId}`)
      await revalidate('interest-levels-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Interest Level API */
  static destroy = async (interestLevelId: string) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS + interestLevelId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete interest level')
      }

      await revalidate('interest-levels')
      await revalidate(`interest-levels/${interestLevelId}`)
      await revalidate('interest-levels-all')
      
return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get All Interest Levels API */
  static getAllInterestLevels = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + INTEREST_LEVELS_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['interest-levels-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch all interest levels')
      }

      
return await response.json()
    } catch (error) {
      throw error
    }
  }
}
