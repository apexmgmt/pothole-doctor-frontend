import BusinessLocationService from '@/services/api/locations/business_location.service'
import StaffService from '@/services/api/staff.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, Staff, Warehouse } from '@/types'
import InventoryJobs from '@/views/erp/inventory-jobs/InventoryJobs'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, MaterialJob } from '@/types'

export const dynamic = 'force-dynamic'

export default async function InventoryJobsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [staffsRes, warehousesRes, businessLocationsRes] = await Promise.allSettled([
    StaffService.getAll(),
    WarehouseService.getAll(),
    BusinessLocationService.getAll()
  ])

  let responseData: DataTableApiResponse<MaterialJob> | null = null

  try {
    const response = await MaterialJobService.index({
      ...(resolvedSearchParams as Record<string, string>),
      job_type: 'inventory'
    })

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch inventory jobs:', error)
  }

  const [canCreateJob, canViewJob, canEditJob, canDeleteJob] = await Promise.all([
    hasPermission('Create Material Job'),
    hasPermission('View Material Job'),
    hasPermission('Update Material Job'),
    hasPermission('Delete Material Job')
  ])

  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const warehouses: Warehouse[] = warehousesRes.status === 'fulfilled' ? warehousesRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  return (
    <InventoryJobs
      staffs={staffs}
      warehouses={warehouses}
      businessLocations={businessLocations}
      initialData={responseData}
      permissions={{ canCreateJob, canViewJob, canEditJob, canDeleteJob }}
    />
  )
}
