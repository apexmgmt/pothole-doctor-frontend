import EmailTemplateService from '@/services/api/settings/email_templates.service'
import { EmailTemplate } from '@/types'
import EmailTemplates from '@/views/erp/settings/email-templates/EmailTemplates'

export const dynamic = 'force-dynamic'

export default async function EmailTemplatesPage() {
  let emailTemplates: EmailTemplate[] = []

  try {
    const response = await EmailTemplateService.index()

    emailTemplates = response.data || []
  } catch (error) {
    emailTemplates = []
  }

  return <EmailTemplates templates={emailTemplates} />
}
