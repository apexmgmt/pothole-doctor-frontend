import { TaskPayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { API_URL, PROPOSAL_TASKS } from '@/constants/api'

export default class ProposalTaskService {
  /**
   * Get proposal tasks API
   * @param proposal_id string
   * @param filterOptions object - Optional query parameters for filtering tasks
   */
  static index = async (proposal_id: string, filterOptions: object = {}) => {
    const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

    try {
      const response = await apiInterceptor(
        API_URL + PROPOSAL_TASKS(proposal_id) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposal tasks')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new proposal task
   * @param proposal_id string
   * @param payload TaskPayload - The data for the new task
   */
  static store = async (proposal_id: string, payload: TaskPayload) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_TASKS(proposal_id), {
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

  /**
   * Get a specific proposal task
   * @param proposal_id string
   * @param task_id string
   */
  static show = async (proposal_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposal task')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a proposal task
   * @param proposal_id string
   * @param task_id string
   * @param payload TaskPayload - The updated data for the task
   */
  static update = async (proposal_id: string, task_id: string, payload: TaskPayload) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
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

  /**
   * Delete Proposal Task Api
   * @param proposal_id
   * @param task_id
   * @returns
   */
  static destroy = async (proposal_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'DELETE'
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
}
