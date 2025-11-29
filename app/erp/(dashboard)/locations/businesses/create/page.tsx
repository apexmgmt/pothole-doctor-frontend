import LocationService from '@/services/api/locations/location.service'
import { Location } from '@/types'
import CreateOrEditBusinessLocation from '@/views/erp/locations/businesses/CreateOrEditBusinessLocation'

const CreateBusinessLocationPage = async () => {
  let countriesWithStateAndCities: Location['countries'] = []
  try {
    const response = await LocationService.index()
    countriesWithStateAndCities = response.data || []
  } catch (error) {
    countriesWithStateAndCities = []
  }
  return <CreateOrEditBusinessLocation countriesWithStateAndCities={countriesWithStateAndCities} />
}

export default CreateBusinessLocationPage
