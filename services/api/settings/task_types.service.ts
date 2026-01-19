import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, TASK_TYPES, TASK_TYPES_ALL, TASK_TYPES_ALL_TENANT, TASK_TYPES_TENANT } from '@/constants/api'
import { TaskTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class TaskTypeService {
  /**Task type DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['task-types'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch task types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Create Task Type API */
  static store = async (payload: TaskTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create task type')
      }

      await revalidate('task-types')
      await revalidate('task-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Task Type API */
  static show = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`task-types/${taskTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch task type details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Task Type API */
  static update = async (taskTypeId: string, payload: TaskTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update task type')
      }

      await revalidate('task-types')
      await revalidate(`task-types/${taskTypeId}`)
      await revalidate('task-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Task Type API */
  static destroy = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete task type')
      }

      await revalidate('task-types')
      await revalidate(`task-types/${taskTypeId}`)
      await revalidate('task-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Restore Task Type API */
  static restore = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId + '/restore',
        {
          requiresAuth: true,
          method: 'POST'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to restore task type')
      }

      await revalidate('task-types')
      await revalidate(`task-types/${taskTypeId}`)
      await revalidate('task-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**Get all task types */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? TASK_TYPES_ALL_TENANT : TASK_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['task-types-all'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch all task types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
