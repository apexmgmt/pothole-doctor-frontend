import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import {
  PROPOSALS_ALL,
  PROPOSALS,
  API_URL,
  PROPOSALS_TENANT,
  PROPOSALS_ALL_TENANT,
  SEND_PROPOSAL_EMAIL,
  VIEW_PROPOSAL,
  REVIEW_PROPOSAL
} from '@/constants/api'
import { ProposalPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ProposalService {
  /**Proposal DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? PROPOSALS_TENANT : PROPOSALS) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['proposals'] } // Cache for 60 seconds
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposals')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Proposal API */
  static store = async (payload: ProposalPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROPOSALS_TENANT : PROPOSALS), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create proposals')
      }

      await revalidate('proposals')
      await revalidate('proposals-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Proposal API */
  static show = async (proposalId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROPOSALS_TENANT : PROPOSALS) + proposalId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`proposals/${proposalId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposals details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Proposal API */
  static update = async (proposalId: string, payload: ProposalPayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROPOSALS_TENANT : PROPOSALS) + proposalId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update proposal')
      }

      await revalidate('proposals')
      await revalidate(`proposals/${proposalId}`)
      await revalidate('proposals-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Proposal API */
  static destroy = async (proposalId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROPOSALS_TENANT : PROPOSALS) + proposalId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete proposal')
      }

      await revalidate('proposals')
      await revalidate(`proposals/${proposalId}`)
      await revalidate('proposals-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get all proposals API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? PROPOSALS_ALL_TENANT : PROPOSALS_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['proposals-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch proposals')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Send proposal email API
   * @param proposalId - The ID of the proposal
   * @param subject - Optional custom subject for the email
   * @param message - Optional custom message for the email
   * @returns The response from the API
   */
  static sendEmail = async (proposalId: string, subject?: string, message?: string) => {
    try {
      const response = await apiInterceptor(API_URL + SEND_PROPOSAL_EMAIL(proposalId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify({ subject, message })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to send proposal email')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * View proposal API for clients
   * @param proposalHashId - The hash ID of the proposal
   * @param clientHashId - The hash ID of the client
   * @param iscus - Optional flag to indicate if the proposal is for a specific client (1 or 0)
   * @returns The response from the API containing proposal details
   */
  static viewProposal = async (proposalHashId: string, clientHashId: string, iscus?: 1 | 0) => {
    try {
      const response = await apiInterceptor(API_URL + VIEW_PROPOSAL(proposalHashId, clientHashId, iscus), {
        requiresAuth: false,
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to view proposal')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /**
   * Review proposal API for clients to submit their review or feedback on the proposal
   * @param proposalHashId string
   * @param clientHashId string
   * @param review string
   * @returns The response from the API
   */
  static reviewProposal = async (proposalHashId: string, clientHashId: string, review: string) => {
    try {
      const response = await apiInterceptor(API_URL + REVIEW_PROPOSAL, {
        requiresAuth: false,
        method: 'POST',
        body: JSON.stringify({ pid: proposalHashId, qcid: clientHashId, review })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to review proposal')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
