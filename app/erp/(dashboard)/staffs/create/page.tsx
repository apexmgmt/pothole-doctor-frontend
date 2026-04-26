import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CommissionTypeService from '@/services/api/settings/commission_types.service'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

export const dynamic = 'force-dynamic'

const CreateStaffPage = async () => {
  const [permissionsRes, rolesRes, commissionTypesRes] = await Promise.allSettled([PermissionService.index(), RoleService.getAll(), CommissionTypeService.getAll()])

  const permissions = permissionsRes.status === 'fulfilled' ? permissionsRes.value.data || {} : {}
  const roles = rolesRes.status === 'fulfilled' ? rolesRes.value?.data || [] : []
  const commissionTypes = commissionTypesRes.status === 'fulfilled' ? commissionTypesRes.value?.data || [] : []

  return <CreateOrEditStaff mode='create' permissions={permissions} roles={roles} commissionTypes={commissionTypes} />
}

export default CreateStaffPage
