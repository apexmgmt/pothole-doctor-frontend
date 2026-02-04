import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

export const dynamic = 'force-dynamic'

const CreateStaffPage = async () => {
  let permissions = {}

  try {
    const response = await PermissionService.index()

    permissions = response.data || {}
  } catch (error) {
    permissions = {}
  }

  let roles = []

  try {
    const response = await RoleService.getAll()

    roles = response?.data || []
  } catch (error) {
    roles = []
  }

  return <CreateOrEditStaff mode='create' permissions={permissions} roles={roles} />
}

export default CreateStaffPage
