import { TaskCommentPayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { API_URL, TASKS_COMMENTS } from '@/constants/api'

export default class TaskCommentService {
  /**Task Comments API */
  static index = async (taskId: string) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_COMMENTS(taskId), {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch task comments')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Task Comment API */
  static store = async (taskId: string, payload: TaskCommentPayload) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_COMMENTS(taskId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Task Comment API */
  static show = async (taskId: string, commentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_COMMENTS(taskId) + commentId, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch task comment details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Task Comment API */
  static update = async (taskId: string, commentId: string, payload: TaskCommentPayload) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_COMMENTS(taskId) + commentId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Task Comment API */
  static destroy = async (taskId: string, commentId: string) => {
    try {
      const response = await apiInterceptor(API_URL + TASKS_COMMENTS(taskId) + commentId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete tasks')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
