import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import { BusinessLocation, CountryWithStates, PartnerType } from '@/types'
import Partners from '@/views/erp/partners/Partners'

export default async function PartnersPage() {
  let businessLocations: BusinessLocation[] = []
  let partnerTypes: PartnerType[] = []
  let countriesWithStatesAndCities: CountryWithStates[] = []

  try {
    const response = await BusinessLocationService.getAllBusinessLocations()
    businessLocations = response.data || []
  } catch (error) {
    businessLocations = []
  }

  try {
    const response = await PartnerTypesService.getAllPartnerTypes()
    partnerTypes = response.data || []
  } catch (error) {
    partnerTypes = []
  }

  try {
    const response = await LocationService.index()
    countriesWithStatesAndCities = response.data || []
  } catch (error) {
    countriesWithStatesAndCities = []
  }

  return (
    <Partners
      businessLocations={businessLocations}
      partnerTypes={partnerTypes}
      countriesWithStatesAndCities={countriesWithStatesAndCities}
    />
  )
}
