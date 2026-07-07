import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import RoleService from '@/services/api/role.service'
import { DataTableApiResponse } from '@/types'
import Roles from '@/views/erp/roles/Roles'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Roles | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} roles.`
}

const RolesPage = async ({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<any> | null = null

  try {
    const response = await RoleService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  }

  const [canCreateRole, canEditRole, canDeleteRole] = await Promise.all([
    hasPermission('Create Role'),
    hasPermission('Update Role'),
    hasPermission('Delete Role')
  ])

  return <Roles initialData={responseData} permissions={{ canCreateRole, canEditRole, canDeleteRole }} />
}

export default RolesPage
