import BusinessLocationService from '@/services/api/locations/business_location.service'
import StaffService from '@/services/api/staff.service'
import WarehouseService from '@/services/api/warehouses.service'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { BusinessLocation, Staff, Warehouse, MaterialJob, DataTableApiResponse } from '@/types'
import MaterialJobs from '@/views/erp/material-jobs/MaterialJobs'

export const dynamic = 'force-dynamic'

export default async function MaterialJobsPage({
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

  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const warehouses: Warehouse[] = warehousesRes.status === 'fulfilled' ? warehousesRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  let responseData: DataTableApiResponse<MaterialJob> | null = null

  try {
    const response = await MaterialJobService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch material jobs:', error)
  }

  return (
    <MaterialJobs
      staffs={staffs}
      warehouses={warehouses}
      businessLocations={businessLocations}
      initialData={responseData}
    />
  )
}
