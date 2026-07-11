import { TaskPayload } from '@/types'
import { handleRequest } from '@/services/api/base.service'
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
      const response = await handleRequest(
        API_URL + PROPOSAL_TASKS(proposal_id) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return response
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
      const response = await handleRequest(API_URL + PROPOSAL_TASKS(proposal_id), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      return response
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
      const response = await handleRequest(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'GET'
      })

      return response
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
      const response = await handleRequest(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      return response
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
      const response = await handleRequest(API_URL + PROPOSAL_TASKS(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'DELETE'
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
