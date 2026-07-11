import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, TASK_TYPES, TASK_TYPES_ALL, TASK_TYPES_ALL_TENANT, TASK_TYPES_TENANT } from '@/constants/api'
import { TaskTypePayload } from '@/types'

export default class TaskTypeService {
  /**Task type DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: {
            revalidate: 30,
            tags: ['login', 'task-types', queryParams ? `task-types?${queryParams}` : 'task-types']
          }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create Task Type API */
  static store = async (payload: TaskTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['task-types', 'task-types-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Task Type API */
  static show = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `task-types/${taskTypeId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Task Type API */
  static update = async (taskTypeId: string, payload: TaskTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['task-types', 'task-types-all', `task-types/${taskTypeId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Task Type API */
  static destroy = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['task-types', 'task-types-all', `task-types/${taskTypeId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Restore Task Type API */
  static restore = async (taskTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? TASK_TYPES_TENANT : TASK_TYPES) + taskTypeId + '/restore',
        {
          requiresAuth: true,
          method: 'POST',
          revalidateTags: ['task-types', 'task-types-all', `task-types/${taskTypeId}`]
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /**Get all task types */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? TASK_TYPES_ALL_TENANT : TASK_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['login', 'task-types-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
