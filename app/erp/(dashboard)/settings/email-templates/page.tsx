import EmailTemplateService from '@/services/api/settings/email_templates.service'
import { EmailTemplate } from '@/types'
import EmailTemplates from '@/views/erp/settings/email-templates/EmailTemplates'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function EmailTemplatesPage() {
  let emailTemplates: EmailTemplate[] = []

  try {
    const response = await EmailTemplateService.index()

    emailTemplates = response.data || []
  } catch (error) {
    emailTemplates = []
  }

  const [canManageMessageTemplates, canUpdateMessageTemplates, canViewMessageTemplates] = await Promise.all([
    hasPermission('Manage Message Template'),
    hasPermission('Update Message Template'),
    hasPermission('View Message Template')
  ])

  return (
    <EmailTemplates
      templates={emailTemplates}
      permissions={{ canManageMessageTemplates, canUpdateMessageTemplates, canViewMessageTemplates }}
    />
  )
}
