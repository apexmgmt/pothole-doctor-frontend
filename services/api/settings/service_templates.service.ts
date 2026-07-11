import { API_URL, SERVICE_TEMPLATES, SERVICE_TEMPLATES_ALL, SERVICE_TEMPLATES_RESTORE } from '@/constants/api'
import { handleRequest } from '@/services/api/base.service'
import { ServiceTemplatePayload } from '@/types'

export default class ServiceTemplateService {
  /**
   * Fetches a list of service templates based on the provided filter options.
   *
   * @param filterOptions An object containing key-value pairs for filtering the service templates.
   * @returns A promise that resolves to the list of service templates matching the filter criteria.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static index = async (filterOptions: object) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()

      const response = await handleRequest(API_URL + SERVICE_TEMPLATES + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: {
          revalidate: 30,
          tags: ['login', 'service-templates', queryParams ? `service-templates?${queryParams}` : 'service-templates']
        }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Creates a new service template with the provided payload. (Step 1 like estimate creation)
   */
  static store = async (payload: ServiceTemplatePayload) => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['service-templates', 'service-templates-all']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetches the details of a specific service template by its ID.
   *
   * @param serviceTemplateId The ID of the service template to be fetched.
   * @returns A promise that resolves to the service template data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static show = async (serviceTemplateId: string) => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES + serviceTemplateId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['login', `service-templates/${serviceTemplateId}`] }
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Updates an existing service template with the provided payload.
   *
   * @param serviceTemplateId The ID of the service template to be updated.
   * @param payload An object containing the updated service template data.
   * @returns A promise that resolves to the updated service template data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static update = async (serviceTemplateId: string, payload: ServiceTemplatePayload) => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES + serviceTemplateId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['service-templates', 'service-templates-all', `service-templates/${serviceTemplateId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Deletes an existing service template by its ID.
   *
   * @param serviceTemplateId The ID of the service template to be deleted.
   * @returns A promise that resolves to the deletion response if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static destroy = async (serviceTemplateId: string) => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES + serviceTemplateId, {
        requiresAuth: true,
        method: 'DELETE',
        revalidateTags: ['service-templates', 'service-templates-all', `service-templates/${serviceTemplateId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Restores a deleted service template by its ID.
   *
   * @param serviceTemplateId The ID of the service template to be restored.
   * @returns A promise that resolves to the restored service template data if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static restore = async (serviceTemplateId: string) => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES_RESTORE(serviceTemplateId), {
        requiresAuth: true,
        method: 'POST',
        revalidateTags: ['service-templates', 'service-templates-all', `service-templates/${serviceTemplateId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetches a list of all service templates without any filters. This method is used for fetching service templates in dropdowns or other UI elements where we need to show all service templates.
   *
   * @returns A promise that resolves to the list of all service templates if the request is successful.
   * @throws An error if the API request fails or returns a non-OK response.
   */
  static getAll = async () => {
    try {
      const response = await handleRequest(API_URL + SERVICE_TEMPLATES_ALL, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 3600, tags: ['login', 'service-templates-all'] }
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
