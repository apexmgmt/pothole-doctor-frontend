import CommissionService from '@/services/api/settings/commissions.service'
import { CommissionBase, CommissionFilter, CommissionType } from '@/types'
import Commissions from '@/views/erp/settings/commissions/Commissions'

export default async function CommissionsPage() {
  let commissionTypes: CommissionType[] = []
  let commissionFilters: CommissionFilter[] = []
  let commissionBases: CommissionBase[] = []

  try {
    const response = await CommissionService.getAllCommissionTypes()
    commissionTypes = response.data || []
  } catch (error) {
    commissionTypes = []
  }

  try {
    const response = await CommissionService.getAllCommissionFilters()
    commissionFilters = response.data || []
  } catch (error) {
    commissionFilters = []
  }

  try {
    const response = await CommissionService.getAllCommissionBases()
    commissionBases = response.data || []
  } catch (error) {
    commissionBases = []
  }

  return (
    <Commissions
      commissionTypes={commissionTypes}
      commissionFilters={commissionFilters}
      commissionBases={commissionBases}
    />
  )
}
