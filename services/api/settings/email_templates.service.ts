import { EMAIL_TEMPLATES_TENANT } from './../../../constants/api/email_templates_api'
import { getApiUrl, isTenant } from '@/utils/utility'
import { handleRequest } from '@/services/api/base.service'
import { API_URL, EMAIL_TEMPLATES } from '@/constants/api'
import { EmailTemplatePayload } from '@/types'

export default class EmailTemplateService {
  /**Get all email template */
  static index = async (group?: string) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(
        API_URL + (isTenantApi ? EMAIL_TEMPLATES_TENANT : EMAIL_TEMPLATES) + (group ? `?group=${group}` : ''),
        {
          requiresAuth: true,
          method: 'GET',
          next: { revalidate: 30, tags: ['login', 'email-templates', group ? `email-templates?group=${group}` : 'email-templates'] }
        }
      )

      return response
    } catch (error) {
      throw error
    }
  }

  /** Update Email Template by ID */
  static update = async (id: string, payload: EmailTemplatePayload) => {
    try {
      const isTenantApi = await isTenant()

      const response = await handleRequest(API_URL + (isTenantApi ? EMAIL_TEMPLATES_TENANT : EMAIL_TEMPLATES) + id, {
        requiresAuth: true,
        method: 'PUT',
        body: JSON.stringify(payload),
        revalidateTags: ['email-templates']
      })

      return response
    } catch (error) {
      throw error
    }
  }
}
