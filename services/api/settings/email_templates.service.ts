import { EMAIL_TEMPLATES_TENANT } from './../../../constants/api/email_templates_api'
import { getApiUrl, isTenant } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { API_URL, EMAIL_TEMPLATES } from '@/constants/api'
import { EmailTemplatePayload } from '@/types'

export default class EmailTemplateService {
  /**Get all email template */
  static index = async (group?: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(
        API_URL + (isTenantApi ? EMAIL_TEMPLATES_TENANT : EMAIL_TEMPLATES) + (group ? `?group=${group}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to fetch email templates')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  /** Update Email Template by ID */
  static update = async (id: string, payload: EmailTemplatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await apiInterceptor(API_URL + (isTenantApi ? EMAIL_TEMPLATES_TENANT : EMAIL_TEMPLATES) + id, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to update email template')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
