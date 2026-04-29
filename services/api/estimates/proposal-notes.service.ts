import { ClientNotePayload } from '@/types'
import apiInterceptor from '../api.interceptor'
import { API_URL, PROPOSAL_NOTES } from '@/constants/api'

export default class ProposalNoteService {
  /**
   * Get proposal notes API
   * @param proposal_id string
   * @param filterOptions object - Optional query parameters for filtering notes
   */
  static index = async (proposal_id: string, filterOptions: object = {}) => {
    const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

    try {
      const response = await apiInterceptor(
        API_URL + PROPOSAL_NOTES(proposal_id) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposal notes')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Create a new proposal note
   * @param proposal_id string
   * @param payload ClientNotePayload - The data for the new note
   */
  static store = async (proposal_id: string, payload: ClientNotePayload) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_NOTES(proposal_id), {
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
   * Get a specific proposal note
   * @param proposal_id string
   * @param task_id string
   */
  static show = async (proposal_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_NOTES(proposal_id) + `${task_id}/`, {
        requiresAuth: true,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposal note')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a proposal note
   * @param proposal_id string
   * @param task_id string
   * @param payload ClientNotePayload - The updated data for the note
   */
  static update = async (proposal_id: string, task_id: string, payload: ClientNotePayload) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_NOTES(proposal_id) + `${task_id}/`, {
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
   * Delete Proposal Note Api
   * @param proposal_id
   * @param task_id
   * @returns
   */
  static destroy = async (proposal_id: string, task_id: string) => {
    try {
      const response = await apiInterceptor(API_URL + PROPOSAL_NOTES(proposal_id) + `${task_id}/`, {
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
