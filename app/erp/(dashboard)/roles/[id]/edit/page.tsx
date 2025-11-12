import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CreateOrEditRole from '@/views/erp/roles/CreateOrEditRole'

const EditRolePage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  // Fetch permissions
  let permissions = {}
  try {
    const response = await PermissionService.index()
    permissions = response.data || {}
  } catch (error) {
    permissions = {}
  }

  // Fetch role details
  let roleDetails = {}
  try {
    const response = await RoleService.show(id)
    roleDetails = response.data || {}
  } catch (error) {
    roleDetails = {}
  }

  return <CreateOrEditRole mode='edit' permissions={permissions} roleId={id} roleDetails={roleDetails} />
}

export default EditRolePage
