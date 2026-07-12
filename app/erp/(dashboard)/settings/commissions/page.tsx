import CommissionTypeService from '@/services/api/settings/commission_types.service'
import CommissionService from '@/services/api/settings/commissions.service'
import { CommissionBase, CommissionFilter, CommissionType, DataTableApiResponse, Commission } from '@/types'
import Commissions from '@/views/erp/settings/commissions/Commissions'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function CommissionsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let responseData: DataTableApiResponse<Commission> | null = null

  try {
    const response = await CommissionService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch commissions:', error)
  }

  const [commissionTypesRes, commissionFiltersRes, commissionBasesRes] = await Promise.allSettled([
    CommissionTypeService.getAll(),
    CommissionService.getAllCommissionFilters(),
    CommissionService.getAllCommissionBases()
  ])

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Commission'),
    hasPermission('Update Commission'),
    hasPermission('Delete Commission')
  ])

  const commissionTypes: CommissionType[] =
    commissionTypesRes.status === 'fulfilled' ? commissionTypesRes.value.data || [] : []

  const commissionFilters: CommissionFilter[] =
    commissionFiltersRes.status === 'fulfilled' ? commissionFiltersRes.value.data || [] : []

  const commissionBases: CommissionBase[] =
    commissionBasesRes.status === 'fulfilled' ? commissionBasesRes.value.data || [] : []

  const permissions = {
    canCreate,
    canEdit,
    canDelete
  }

  return (
    <Commissions
      commissionTypes={commissionTypes}
      commissionFilters={commissionFilters}
      commissionBases={commissionBases}
      initialData={responseData}
      permissions={permissions}
    />
  )
}
