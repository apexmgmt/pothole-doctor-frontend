import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

export const dynamic = 'force-dynamic'

const CreateStaffPage = async () => {
  const [permissionsRes, rolesRes] = await Promise.allSettled([PermissionService.index(), RoleService.getAll()])

  const permissions = permissionsRes.status === 'fulfilled' ? permissionsRes.value.data || {} : {}
  const roles = rolesRes.status === 'fulfilled' ? rolesRes.value?.data || [] : []

  return <CreateOrEditStaff mode='create' permissions={permissions} roles={roles} />
}

export default CreateStaffPage
