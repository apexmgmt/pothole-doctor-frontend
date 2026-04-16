import apiInterceptor from '../api.interceptor'
import { API_URL, MATERIAL_JOBS, MATERIAL_JOBS_ACTIONS } from '@/constants/api'
import { MaterialJobActionPayload } from '@/types'
import { revalidate } from '../../app/cache.service'

export default class MaterialJobService {
  /** Material Jobs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await apiInterceptor(API_URL + MATERIAL_JOBS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: ['material-jobs'] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch material jobs')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Show Material Job API */
  static show = async (materialJobId: string) => {
    try {
      const response = await apiInterceptor(API_URL + MATERIAL_JOBS + materialJobId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`material-jobs/${materialJobId}`] }
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch material job details')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Create Material Job Action API */
  static storeAction = async (materialJobId: string, payload: MaterialJobActionPayload) => {
    try {
      const response = await apiInterceptor(API_URL + MATERIAL_JOBS_ACTIONS(materialJobId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw errorData
      }

      await revalidate('material-jobs')
      await revalidate(`material-jobs/${materialJobId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Delete Material Job Action API (Latest First)*/
  static destroyAction = async (materialJobId: string, actionId: string) => {
    try {
      const response = await apiInterceptor(API_URL + MATERIAL_JOBS_ACTIONS(materialJobId) + `/${actionId}`, {
        requiresAuth: true,
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to delete material job action')
      }

      await revalidate('material-jobs')
      await revalidate(`material-jobs/${materialJobId}`)

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
