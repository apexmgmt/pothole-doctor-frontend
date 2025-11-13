import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import StaffService from '@/services/api/staff.service'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

const StaffEditPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  let permissions = {}
  try {
    const response = await PermissionService.index()
    permissions = response.data || {}
  } catch (error) {
    permissions = {}
  }

  let roles = []
  try {
    const response = await RoleService.index({ per_page: 1000 })
    roles = response?.data?.data || []
  } catch (error) {
    roles = []
  }

  let staffDetails = null
  try {
    const response = await StaffService.show(id)
    staffDetails = response.data || null
  } catch (error) {
    staffDetails = null
  }
  return <CreateOrEditStaff mode='edit' permissions={permissions} roles={roles} staffId={id} staffData={staffDetails} />
}

export default StaffEditPage
