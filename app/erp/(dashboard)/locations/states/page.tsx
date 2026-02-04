import LocationService from '@/services/api/locations/location.service'
import { CountryWithStates } from '@/types'
import States from '@/views/erp/locations/states/States'

export const dynamic = 'force-dynamic'

const StatesPage = async () => {
  let countriesWithStateAndCities: CountryWithStates[] = []

  try {
    const response = await LocationService.index()

    countriesWithStateAndCities = response.data || []
  } catch (error) {
    countriesWithStateAndCities = []
  }

  return <States countriesWithStateAndCities={countriesWithStateAndCities} />
}

export default StatesPage
