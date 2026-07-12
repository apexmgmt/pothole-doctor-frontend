import ContractTemplates from '@/views/erp/settings/ContractTemplates'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import ContractTemplateService from '@/services/api/settings/contract_templates.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, ContractTemplate } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ContractTemplatesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let estimateTypes = []
  let initialData: DataTableApiResponse<ContractTemplate> | null = null

  try {
    const [estimateTypesResponse, templatesResponse] = await Promise.allSettled([
      EstimateTypeService.getAll(),
      ContractTemplateService.index(resolvedSearchParams as Record<string, string>)
    ])

    if (estimateTypesResponse.status === 'fulfilled' && estimateTypesResponse.value?.data) {
      estimateTypes = estimateTypesResponse.value.data
    }

    if (templatesResponse.status === 'fulfilled') {
      initialData = templatesResponse.value?.data || null
    }
  } catch (error) {
    console.error('Failed to fetch data for contract templates page:', error)
  }

  const [canCreateTemplate, canEditTemplate, canDeleteTemplate] = await Promise.all([
    hasPermission('Create Contract Template'),
    hasPermission('Update Contract Template'),
    hasPermission('Delete Contract Template')
  ])

  return (
    <ContractTemplates
      estimateTypes={estimateTypes}
      initialData={initialData}
      permissions={{ canCreateTemplate, canEditTemplate, canDeleteTemplate }}
    />
  )
}
