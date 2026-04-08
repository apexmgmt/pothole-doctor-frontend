import BusinessLocationService from '@/services/api/locations/business_location.service'
import VendorService from '@/services/api/vendors/vendors.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, Vendor, Warehouse } from '@/types'

export default async function PurchaseOrdersPage() {
  const [vendorsRes, warehousesRes, businessLocationsRes] = await Promise.allSettled([
    VendorService.getAll(),
    WarehouseService.getAll(),
    BusinessLocationService.getAll()
  ])

  const vendors: Vendor[] = vendorsRes.status === 'fulfilled' ? ((vendorsRes.value.data as Vendor[]) ?? []) : []

  const warehouses: Warehouse[] =
    warehousesRes.status === 'fulfilled' ? ((warehousesRes.value.data as Warehouse[]) ?? []) : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? ((businessLocationsRes.value.data as BusinessLocation[]) ?? []) : []

  return <div>PurchaseOrders Page</div>
}
