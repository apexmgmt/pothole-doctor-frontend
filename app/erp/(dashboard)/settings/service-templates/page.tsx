import ServiceTemplates from '@/views/erp/settings/ServiceTemplates'
import ServiceTemplateService from '@/services/api/settings/service_templates.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, ServiceTemplate } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ServiceTemplatesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<ServiceTemplate> | null = null

  try {
    const response = await ServiceTemplateService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch service templates:', error)
  }

  const [canCreateTemplate, canEditTemplate, canDeleteTemplate] = await Promise.all([
    hasPermission('Create Service Template'),
    hasPermission('Update Service Template'),
    hasPermission('Delete Service Template')
  ])

  return (
    <ServiceTemplates
      initialData={initialData}
      permissions={{ canCreateTemplate, canEditTemplate, canDeleteTemplate }}
    />
  )
}
