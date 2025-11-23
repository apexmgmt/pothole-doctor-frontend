import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { BusinessLocation, Location } from '@/types'
import CreateOrEditBusinessLocation from '@/views/erp/locations/businesses/CreateOrEditBusinessLocation'

const EditBusinessLocationPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params
  let countriesWithStateAndCities: Location['countries'] = []
  try {
    const response = await LocationService.index()
    countriesWithStateAndCities = response.data || []
  } catch (error) {
    countriesWithStateAndCities = []
  }

  let businessLocationDetails: BusinessLocation | null = null
  try {
    const response = await BusinessLocationService.show(id)
    businessLocationDetails = response.data || null
  } catch (error) {
    businessLocationDetails = null
  }
  return (
    <CreateOrEditBusinessLocation
      mode='edit'
      businessLocationId={id}
      countriesWithStateAndCities={countriesWithStateAndCities}
      businessLocationDetails={businessLocationDetails}
    />
  )
}

export default EditBusinessLocationPage
