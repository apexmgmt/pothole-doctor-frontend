import { getApiUrl } from '@/utils/utility'
import apiInterceptor from './api.interceptor'
import { TASKS_ALL, TASKS } from '@/constants/api'
import { TaskPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class TaskService {
  /**Task DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + TASKS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['tasks'] } // Cache for 60 seconds
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

  /** Create Task API */
  static store = async (payload: TaskPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASKS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create tasks')
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASKS + taskId, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASKS + taskId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update tasks')
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASKS + taskId, {
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

  /** Get all tasks API */
  static getAllTasks = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + TASKS_ALL, {
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
