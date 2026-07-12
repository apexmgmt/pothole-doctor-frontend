import { handleRequest } from '@/services/api/base.service'
import { API_URL, MATERIAL_JOBS, MATERIAL_JOBS_ACTIONS, MATERIAL_JOBS_EXPORT_TENANT } from '@/constants/api'
import { MaterialJobActionPayload, MaterialJobUpdatePayload } from '@/types'

export default class MaterialJobService {
  /** Material Jobs DataTable API */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + MATERIAL_JOBS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: {
          revalidate: 30,
          tags: ['login', 'material-jobs', queryParams ? `material-jobs?${queryParams}` : 'material-jobs']
        }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Export material jobs API
   */
  static exportMaterialJobs = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(
        API_URL + MATERIAL_JOBS_EXPORT_TENANT + (queryParams ? `?${queryParams}` : ''),
        {
          requiresAuth: true,
          method: 'GET'
        }
      )

      return await response.blob()
    } catch (error) {
      throw error
    }
  }

  /** Show Material Job API */
  static show = async (materialJobId: string) => {
    try {
      const response = await handleRequest(API_URL + MATERIAL_JOBS + materialJobId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `material-jobs/${materialJobId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Material Job API */
  static update = async (materialJobId: string, payload: MaterialJobUpdatePayload) => {
    try {
      const response = await handleRequest(API_URL + MATERIAL_JOBS + materialJobId + '/non-inventory', {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['material-jobs', `material-jobs/${materialJobId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Material Job Action API */
  static storeAction = async (materialJobId: string, payload: MaterialJobActionPayload) => {
    try {
      const response = await handleRequest(API_URL + MATERIAL_JOBS_ACTIONS(materialJobId), {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['material-jobs', `material-jobs/${materialJobId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Material Job Action API (Latest First)*/
  static destroyAction = async (materialJobId: string, actionId: string) => {
    try {
      const response = await handleRequest(API_URL + MATERIAL_JOBS_ACTIONS(materialJobId) + `/${actionId}`, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['material-jobs', `material-jobs/${materialJobId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
