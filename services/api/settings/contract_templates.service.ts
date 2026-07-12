import { handleRequest } from '@/services/api/base.service'
import { API_URL, CONTRACT_TEMPLATES, CONTRACT_TEMPLATES_ALL } from '@/constants/api'
import { ContractTemplatePayload } from '@/types'

export default class ContractTemplateService {
  /**
   * Summary of the index API
   *
   * Contract templates data with pagination and filter options.
   * Pass filter to get the filtered results.
   */
  static index = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + CONTRACT_TEMPLATES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: {
          revalidate: 30,
          tags: [
            'login',
            'contract-templates',
            queryParams ? `contract-templates?${queryParams}` : 'contract-templates'
          ]
        }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Create Contract Template API */
  static store = async (payload: ContractTemplatePayload) => {
    try {
      const response = await handleRequest(API_URL + CONTRACT_TEMPLATES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['contract-templates', 'contract-templates-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Show Contract Template API */
  static show = async (contractTemplateId: string) => {
    try {
      const response = await handleRequest(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `contract-templates/${contractTemplateId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Contract Template API */
  static update = async (contractTemplateId: string, payload: ContractTemplatePayload) => {
    try {
      const response = await handleRequest(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['contract-templates', 'contract-templates-all', `contract-templates/${contractTemplateId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Delete Contract Template API */
  static destroy = async (contractTemplateId: string) => {
    try {
      const response = await handleRequest(API_URL + CONTRACT_TEMPLATES + contractTemplateId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['contract-templates', 'contract-templates-all', `contract-templates/${contractTemplateId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get all contract templates API (with optional filters) */
  static getAll = async (filterOptions: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const url = API_URL + CONTRACT_TEMPLATES_ALL + (queryParams ? `?${queryParams}` : '')

      const response = await handleRequest(url, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['login', 'contract-templates-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
