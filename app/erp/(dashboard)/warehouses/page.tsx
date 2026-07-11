import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import WarehouseService from '@/services/api/warehouses.service'
import { BusinessLocation, CountryWithStates, DataTableApiResponse, Warehouse } from '@/types'
import Warehouses from '@/views/erp/warehouses/Warehouses'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function WarehousesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [businessLocationsRes, locationsRes] = await Promise.allSettled([
    BusinessLocationService.getAll(),
    LocationService.index()
  ])

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? (businessLocationsRes.value?.data ?? []) : []

  const countriesWithStateAndCities: CountryWithStates[] =
    locationsRes.status === 'fulfilled' ? (locationsRes.value.data ?? []) : []

  let responseData: DataTableApiResponse<Warehouse> | null = null

  try {
    const response = await WarehouseService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch warehouses:', error)
  }

  const [canCreateWarehouse, canViewWarehouse, canEditWarehouse, canDeleteWarehouse, canManagePurchaseOrder] = await Promise.all([
    hasPermission('Create Warehouse'),
    hasPermission('View Warehouse'),
    hasPermission('Update Warehouse'),
    hasPermission('Delete Warehouse'),
    hasPermission('Manage Purchase Order')
  ])

  return (
    <Warehouses
      businessLocations={businessLocations}
      countriesWithStateAndCities={countriesWithStateAndCities}
      initialData={responseData}
      permissions={{ canCreateWarehouse, canViewWarehouse, canEditWarehouse, canDeleteWarehouse, canManagePurchaseOrder }}
    />
  )
}
