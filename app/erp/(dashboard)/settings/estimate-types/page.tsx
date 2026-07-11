import EstimateTypes from '@/views/erp/settings/estimate-types/EstimateTypes'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, EstimateType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function EstimateTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let initialData: DataTableApiResponse<EstimateType> | null = null

  try {
    const response = await EstimateTypeService.index(resolvedSearchParams as Record<string, string>)

    initialData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch estimate types:', error)
  }

  const [canCreateType, canEditType, canDeleteType] = await Promise.all([
    hasPermission('Create Estimate Type'),
    hasPermission('Update Estimate Type'),
    hasPermission('Delete Estimate Type')
  ])

  return <EstimateTypes initialData={initialData} permissions={{ canCreateType, canEditType, canDeleteType }} />
}
