import LocationService from '@/services/api/locations/location.service'
import { CountryWithStates } from '@/types'
import Cities from '@/views/erp/locations/cities/Cities'

export const dynamic = 'force-dynamic'

const CitiesPage = async () => {
  let countriesWithStateAndCities: CountryWithStates[] = []

  try {
    const response = await LocationService.index()

    countriesWithStateAndCities = response.data || []
  } catch (error) {
    countriesWithStateAndCities = []
  }

  return <Cities countriesWithStateAndCities={countriesWithStateAndCities} />
}

export default CitiesPage
