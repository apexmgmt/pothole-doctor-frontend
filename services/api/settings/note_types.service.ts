import { isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, NOTE_TYPES, NOTE_TYPES_ALL, NOTE_TYPES_ALL_TENANT, NOTE_TYPES_TENANT } from '@/constants/api'
import { NoteTypePayload } from '@/types'
import { revalidate } from '@/services/app/cache.service'

export default class NoteTypeService {
  /**Note types DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const isTenantApi = await isTenant()
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['note-types'] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch note types')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Note Types API */
  static store = async (payload: NoteTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to create note types')
      }

      await revalidate('note-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Note Types API */
  static show = async (noteTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`note-types/${noteTypeId}`] } // Cache for 60 seconds
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch note types details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Note Types API */
  static update = async (noteTypeId: string, payload: NoteTypePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update note types')
      }

      await revalidate('note-types')
      await revalidate(`note-types/${noteTypeId}`)
      await revalidate('note-types-all')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Note Types API */
  static destroy = async (noteTypeId: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_TENANT : NOTE_TYPES) + noteTypeId, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete note types')
      }

      await revalidate('note-types-all')
      await revalidate(`note-types/${noteTypeId}`)
      await revalidate('note-types')

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Get All Note Types API */
  static getAll = async () => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? NOTE_TYPES_ALL_TENANT : NOTE_TYPES_ALL), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['note-types-all'] } // Cache for 1 hour
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch note types list')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
