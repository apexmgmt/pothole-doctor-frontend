import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { TASKS_ALL, TASKS, API_URL, TASKS_TENANT, TASKS_ALL_TENANT, TASKS_STATUS_TENANT } from '@/constants/api'
import { TaskPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class TaskService {
  /**Task DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? TASKS_TENANT : TASKS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['tasks'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch tasks')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Task API */
  static store = async (payload: TaskPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASKS_TENANT : TASKS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('tasks')
      await revalidate('tasks-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Task API */
  static show = async (taskId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASKS_TENANT : TASKS) + taskId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`tasks/${taskId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch tasks details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Task API */
  static update = async (taskId: string, payload: TaskPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASKS_TENANT : TASKS) + taskId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('tasks')
      await revalidate(`tasks/${taskId}`)
      await revalidate('tasks-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Summary of the updateStatus API
   *
   * This API is used to update the status of a task when it is dragged and dropped in the Kanban board. It will also update the order of the tasks in the columns that it is coming from and going to.
   * If the task is coming from the same column, it will update the order of the task itself and the tasks that have an order greater than the task's order in that column.
   * If the task is coming from a different column, it will update the order of the task itself and the tasks that have an order greater than the task's order in both the column it is coming from and going to.
   * @param taskId string
   * @param newStatus string (kanban column id)
   * @param newOrder number
   * @returns promise with the updated task data if successful, or an error if the API call fails
   */
  static updateStatus = async (taskId: string, newStatus: string, newOrder: number) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_STATUS_TENANT(taskId), {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify({ status: newStatus, order: newOrder })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update task status')
      }

      await revalidate('tasks')
      await revalidate(`tasks/${taskId}`)
      await revalidate('tasks-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Task API */
  static destroy = async (taskId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASKS_TENANT : TASKS) + taskId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete tasks')
      }

      await revalidate('tasks')
      await revalidate(`tasks/${taskId}`)
      await revalidate('tasks-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all tasks API (with optional filters) */
  static getAll = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const url = API_URL + (isTenantApi ? TASKS_ALL_TENANT : TASKS_ALL) + (queryParams ? `?${queryParams}` : '')

      const response = await apiInterceptor(url, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['tasks-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch tasks')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
