import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { BusinessLocation, Location } from '@/types'
import CreateOrEditBusinessLocation from '@/views/erp/locations/businesses/CreateOrEditBusinessLocation'

const EditBusinessLocationPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  const [locationsRes, businessLocationRes] = await Promise.allSettled([
    LocationService.index(),
    BusinessLocationService.show(id)
  ])

  const countriesWithStateAndCities: Location['countries'] =
    locationsRes.status === 'fulfilled' ? locationsRes.value.data || [] : []

  const businessLocationDetails: BusinessLocation | null =
    businessLocationRes.status === 'fulfilled' ? businessLocationRes.value.data || null : null

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
