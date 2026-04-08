import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { BusinessLocation, CountryWithStates } from '@/types'
import Warehouses from '@/views/erp/warehouses/Warehouses'

export const dynamic = 'force-dynamic'

export default async function WarehousesPage() {
  const [businessLocationsRes, locationsRes] = await Promise.allSettled([
    BusinessLocationService.getAll(),
    LocationService.index()
  ])

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? (businessLocationsRes.value?.data ?? []) : []

  const countriesWithStateAndCities: CountryWithStates[] =
    locationsRes.status === 'fulfilled' ? (locationsRes.value.data ?? []) : []

  return <Warehouses businessLocations={businessLocations} countriesWithStateAndCities={countriesWithStateAndCities} />
}
