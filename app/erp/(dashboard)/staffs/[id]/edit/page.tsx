import PermissionService from '@/services/api/permission.service'
import RoleService from '@/services/api/role.service'
import StaffService from '@/services/api/staff.service'
import CreateOrEditStaff from '@/views/erp/staffs/CreateOrEditStaff'

const StaffEditPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const [permissionsRes, rolesRes, staffDetailsRes] = await Promise.allSettled([
    PermissionService.index(),
    RoleService.getAll(),
    StaffService.show(id)
  ])

  const permissions = permissionsRes.status === 'fulfilled' ? permissionsRes.value.data || {} : {}
  const roles = rolesRes.status === 'fulfilled' ? rolesRes.value?.data || [] : []
  const staffDetails = staffDetailsRes.status === 'fulfilled' ? staffDetailsRes.value.data || null : null

  return <CreateOrEditStaff mode='edit' permissions={permissions} roles={roles} staffId={id} staffData={staffDetails} />
}

export default StaffEditPage
