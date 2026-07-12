import CommissionTypes from '@/views/erp/settings/commission-types/CommissionTypes'
import CommissionTypeService from '@/services/api/settings/commission_types.service'
import { DataTableApiResponse, CommissionType } from '@/types'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function CommissionTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let responseData: DataTableApiResponse<CommissionType> | null = null

  try {
    const response = await CommissionTypeService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch commission types:', error)
  }

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Commission'),
    hasPermission('Update Commission'),
    hasPermission('Delete Commission')
  ])

  return (
    <CommissionTypes
      initialData={responseData}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  )
}
