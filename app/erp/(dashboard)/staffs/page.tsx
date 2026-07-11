import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import StaffService from '@/services/api/staff.service'
import { DataTableApiResponse, Staff } from '@/types'
import Staffs from '@/views/erp/staffs/Staffs'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Staffs | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} staffs.`
}

export default async function StaffsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<Staff> | null = null

  try {
    const response = await StaffService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch staffs:', error)
  }

  const [canCreateStaff, canViewStaff, canEditStaff, canDeleteStaff] = await Promise.all([
    hasPermission('Create Staff'),
    hasPermission('View Staff'),
    hasPermission('Update Staff'),
    hasPermission('Delete Staff')
  ])

  return (
    <Staffs initialData={responseData} permissions={{ canCreateStaff, canViewStaff, canEditStaff, canDeleteStaff }} />
  )
}
