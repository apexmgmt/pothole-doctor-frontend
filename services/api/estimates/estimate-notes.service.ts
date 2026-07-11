import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, ESTIMATE_NOTES, ESTIMATE_NOTES_TENANT } from '@/constants/api'
import { revalidate } from '@/services/app/cache.service'
import { EstimateNotePayload } from '@/types'

export default class EstimateNoteService {
  /**Estimate Notes API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_NOTES_TENANT : ESTIMATE_NOTES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['estimate-notes'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Estimate Note API */
  static store = async (payload: EstimateNotePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? ESTIMATE_NOTES_TENANT : ESTIMATE_NOTES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('estimate-notes')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Estimate Note API */
  static show = async (estimateNoteId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_NOTES_TENANT : ESTIMATE_NOTES) + estimateNoteId,
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: [`estimate-notes/${estimateNoteId}`] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Estimate Note API */
  static update = async (estimateNoteId: string, payload: EstimateNotePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_NOTES_TENANT : ESTIMATE_NOTES) + estimateNoteId,
        {
          requiresAuth: true,
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      )

      await revalidate('estimate-notes')
      await revalidate(`estimate-notes/${estimateNoteId}`)

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Estimate Note API */
  static destroy = async (estimateNoteId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? ESTIMATE_NOTES_TENANT : ESTIMATE_NOTES) + estimateNoteId,
        {
          requiresAuth: true,
          method: 'DELETE'
        }
      )

      await revalidate('estimate-notes')
      await revalidate(`estimate-notes/${estimateNoteId}`)

      return response
    } catch (error) {
      throw error
    }
  }
}
