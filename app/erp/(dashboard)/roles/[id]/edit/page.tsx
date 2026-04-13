import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CreateOrEditRole from '@/views/erp/roles/CreateOrEditRole'

const EditRolePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const [permissionsRes, roleDetailsRes] = await Promise.allSettled([PermissionService.index(), RoleService.show(id)])

  const permissions = permissionsRes.status === 'fulfilled' ? permissionsRes.value.data || {} : {}
  const roleDetails = roleDetailsRes.status === 'fulfilled' ? roleDetailsRes.value.data || {} : {}

  return <CreateOrEditRole mode='edit' permissions={permissions} roleId={id} roleDetails={roleDetails} />
}

export default EditRolePage
