import { handleRequest } from '@/services/api/base.service'
import { API_URL, ORGANIZATIONS, ORGANIZATION_PASSWORD_CHANGE, ORGANIZATION_STATUS_CHANGE } from '@/constants/api'
import { OrganizationCreatePayload, OrganizationEditPayload } from '@/types'

export default class OrganizationService {
  /** Company List API */
  static index = async (filterOptions: object = {}, options: object = {}) => {
    try {
      const queryParams = new URLSearchParams(filterOptions as Record<string, string>).toString()
      const dynamicTag = queryParams ? `organizations?${queryParams}` : 'organizations'

      const response = await handleRequest(API_URL + ORGANIZATIONS + (queryParams ? `?${queryParams}` : ''), {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 30, tags: ['organizations', dynamicTag, 'login'] }, // Cache for 30 seconds
        ...options
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /**Create company API */
  static store = async (payload: OrganizationCreatePayload) => {
    try {
      const response = await handleRequest(API_URL + ORGANIZATIONS, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify(payload),
        revalidateTags: ['organizations']
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Get Organization Details */
  static show = async (organizationId: string) => {
    try {
      const response = await handleRequest(API_URL + ORGANIZATIONS + organizationId, {
        requiresAuth: true,
        method: 'GET',
        next: { revalidate: 60, tags: [`organizations/${organizationId}`] } // Cache for 60 seconds
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Organization Details */
  static update = async (organizationId: string, payload: OrganizationEditPayload) => {
    try {
      const response = await handleRequest(API_URL + ORGANIZATIONS + organizationId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['organizations', `organizations/${organizationId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  /** Organization status change */
  static changeStatus = async (organizationId: string) => {
    try {
      const response = await handleRequest(API_URL + ORGANIZATION_STATUS_CHANGE, {
        requiresAuth: true,
        method: 'POST',
        body: JSON.stringify({ id: organizationId }),
        revalidateTags: ['organizations', `organizations/${organizationId}`]
      })

      return response
    } catch (error) {
      throw error
    }
  }

  static changePassword = async (
    organizationId: string,
    payload: { password: string; password_confirmation: string }
  ) => {
    try {
      const response = await handleRequest(API_URL + ORGANIZATION_PASSWORD_CHANGE + organizationId, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
