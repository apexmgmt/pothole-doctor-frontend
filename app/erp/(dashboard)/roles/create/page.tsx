import PermissionService from '@/services/api/permission.service'
import CreateOrEditRole from '@/views/erp/roles/CreateOrEditRole'

const CreateRole = async () => {
  let permissions = {}
  try {
    const response = await PermissionService.index()
    permissions = response.data || {}
    console.log('Permissions:', permissions)
  } catch (error) {
    permissions = {}
  }

  return <CreateOrEditRole mode='create' permissions={permissions} />
}

export default CreateRole
