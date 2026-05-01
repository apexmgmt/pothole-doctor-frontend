import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CommissionTypeService from '@/services/api/settings/commission_types.service'
import { isTenant } from '@/utils/utility'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

export const dynamic = 'force-dynamic'

const CreateStaffPage = async () => {
  const isTenantDomain = await isTenant()
  const [permissionsRes, rolesRes, commissionTypesRes] = await Promise.allSettled([PermissionService.index(), RoleService.getAll(), CommissionTypeService.getAll()])

  const permissions = permissionsRes.status === 'fulfilled' ? permissionsRes.value.data || {} : {}
  const roles = rolesRes.status === 'fulfilled' ? rolesRes.value?.data || [] : []
  const commissionTypes = commissionTypesRes.status === 'fulfilled' ? commissionTypesRes.value?.data || [] : []

  return <CreateOrEditStaff mode='create' permissions={permissions} roles={roles} commissionTypes={commissionTypes} isTenant={isTenantDomain} />
}

export default CreateStaffPage
