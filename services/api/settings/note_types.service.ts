import { isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, NOTE_TYPES, NOTE_TYPES_ALL, NOTE_TYPES_ALL_TENANT, NOTE_TYPES_TENANT } from '@/constants/api'
import { NoteTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class NoteTypeService {
  /**Note types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 60, tags: ['note-types'] } // Cache for 60 seconds
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Note Types API */
  static store = async (payload: NoteTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      await revalidate('note-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Note Types API */
  static show = async (noteTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`note-types/${noteTypeId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Note Types API */
  static update = async (noteTypeId: string, payload: NoteTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      await revalidate('note-types')
      await revalidate(`note-types/${noteTypeId}`)
      await revalidate('note-types-all')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Note Types API */
  static destroy = async (noteTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      await revalidate('note-types-all')
      await revalidate(`note-types/${noteTypeId}`)
      await revalidate('note-types')

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get All Note Types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? NOTE_TYPES_ALL_TENANT : NOTE_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['note-types-all'] } // Cache for 1 hour
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
