import CommissionTypeService from '@/services/api/settings/commission_types.service'
import CommissionService from '@/services/api/settings/commissions.service'
import { CommissionBase, CommissionFilter, CommissionType } from '@/types'
import Commissions from '@/views/erp/settings/commissions/Commissions'

export const dynamic = 'force-dynamic'

export default async function CommissionsPage() {
  const [commissionTypesRes, commissionFiltersRes, commissionBasesRes] = await Promise.allSettled([
    CommissionTypeService.getAll(),
    CommissionService.getAllCommissionFilters(),
    CommissionService.getAllCommissionBases()
  ])

  const commissionTypes: CommissionType[] =
    commissionTypesRes.status === 'fulfilled' ? commissionTypesRes.value.data || [] : []

  const commissionFilters: CommissionFilter[] =
    commissionFiltersRes.status === 'fulfilled' ? commissionFiltersRes.value.data || [] : []

  const commissionBases: CommissionBase[] =
    commissionBasesRes.status === 'fulfilled' ? commissionBasesRes.value.data || [] : []

  return (
    <Commissions
      commissionTypes={commissionTypes}
      commissionFilters={commissionFilters}
      commissionBases={commissionBases}
    />
  )
}
