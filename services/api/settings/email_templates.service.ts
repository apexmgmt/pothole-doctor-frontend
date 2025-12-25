import { getApiUrl } from '@/utils/utility'
import apiInterceptor from '../api.interceptor'
import { EMAIL_TEMPLATES } from '@/constants/api'
import { EmailTemplatePayload } from '@/types'

export default class EmailTemplateService {
  /**Get all email template */
  static index = async (group?: string) => {
    try {
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + EMAIL_TEMPLATES + (group ? `?group=${group}` : ''), {
        requiresAuth: true,
        method: 'GET',
        cache: 'no-store'
      })

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
      const apiUrl = await getApiUrl()

      const response = await apiInterceptor(apiUrl + EMAIL_TEMPLATES + id, {
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
