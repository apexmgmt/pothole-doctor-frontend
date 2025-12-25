import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { BusinessLocation, CountryWithStates } from '@/types'
import Warehouses from '@/views/erp/warehouses/Warehouses'

export default async function WarehousesPage() {
  let businessLocations: BusinessLocation[] = []
  let countriesWithStateAndCities: CountryWithStates[] = []

  try {
    const response = await BusinessLocationService.getAllBusinessLocations()

    businessLocations = response.data || []
  } catch (error) {
    businessLocations = []
  }

  try {
    const response = await LocationService.index()

    countriesWithStateAndCities = response.data || []
  } catch (error) {
    countriesWithStateAndCities = []
  }

  return <Warehouses businessLocations={businessLocations} countriesWithStateAndCities={countriesWithStateAndCities} />
}
