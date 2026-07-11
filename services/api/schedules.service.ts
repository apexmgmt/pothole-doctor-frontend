import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import {
  TASKS_ALL,
  TASKS,
  API_URL,
  TASKS_TENANT,
  TASKS_ALL_TENANT,
  TASKS_STATUS_TENANT,
  SCHEDULES,
  SCHEDULES_ALL
} from '@/constants/api'
import { SchedulePayload, TaskPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ScheduleService {
  /**
   * Summary of the index API
   *
   * Schedules data with pagination and filter options.
   * Pass filter to get the filtered results.
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + SCHEDULES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['schedules'] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Export schedules
   */
  static exportSchedules = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + SCHEDULES + 'export' + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET'
      })

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Create Schedule API */
  static store = async (payload: SchedulePayload) => {
    try {
      const response = await handleRequest(API_URL + SCHEDULES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('schedules')
      await revalidate('schedules-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Schedule API */
  static show = async (scheduleId: string) => {
    try {
      const response = await handleRequest(API_URL + SCHEDULES + scheduleId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`schedules/${scheduleId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Schedule API */
  static update = async (scheduleId: string, payload: SchedulePayload) => {
    try {
      const response = await handleRequest(API_URL + SCHEDULES + scheduleId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('schedules')
      await revalidate(`schedules/${scheduleId}`)
      await revalidate('schedules-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Schedule API */
  static destroy = async (scheduleId: string) => {
    try {
      const response = await handleRequest(API_URL + SCHEDULES + scheduleId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('schedules')
      await revalidate(`schedules/${scheduleId}`)
      await revalidate('schedules-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all schedules API (with optional filters) */
  static getAll = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const url = API_URL + SCHEDULES_ALL + (queryParams ? `?${queryParams}` : '')

      const response = await handleRequest(url, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['schedules-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
