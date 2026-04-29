import BusinessLocationService from '@/services/api/locations/business_location.service'
import StaffService from '@/services/api/staff.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, Staff, Warehouse } from '@/types'
import InventoryJobs from '@/views/erp/inventory-jobs/InventoryJobs'

export const dynamic = 'force-dynamic'

export default async function InventoryJobsPage() {
  const [staffsRes, warehousesRes, businessLocationsRes] = await Promise.allSettled([
    StaffService.getAll(),
    WarehouseService.getAll(),
    BusinessLocationService.getAll()
  ])

  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const warehouses: Warehouse[] = warehousesRes.status === 'fulfilled' ? warehousesRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  return <InventoryJobs staffs={staffs} warehouses={warehouses} businessLocations={businessLocations} />
}
