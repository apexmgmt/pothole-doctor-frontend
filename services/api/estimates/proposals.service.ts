import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { PROPOSALS_ALL, PROPOSALS } from '@/constants/api'
import { ProposalPayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class ProposalService {
  /**Proposal DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const apiUrl: string = await getApiUrl()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(apiUrl + PROPOSALS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['proposals'] } // Cache for 60 seconds
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

  /** Create Proposal API */
  static store = async (payload: ProposalPayload) => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PROPOSALS, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PROPOSALS + proposalId, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PROPOSALS + proposalId, {
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
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PROPOSALS + proposalId, {
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
  static getAllProposals = async () => {
    try {
      const apiUrl: string = await getApiUrl()

      const response = await apiInterceptor(apiUrl + PROPOSALS_ALL, {
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
}
