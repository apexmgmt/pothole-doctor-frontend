import CompanyService from '@/services/api/companies.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import SkillService from '@/services/api/skills.service'
import { BusinessLocation, Company, CountryWithStates, PartnerType, Skill } from '@/types'
import Partners from '@/views/erp/partners/Partners'

export default async function PartnersPage() {
  let businessLocations: BusinessLocation[] = []
  let partnerTypes: PartnerType[] = []
  let countriesWithStatesAndCities: CountryWithStates[] = []
  let companies: Company[] = []
  let skills: Skill[] = []

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

  try {
    const response = await CompanyService.getAllCompanies()

    companies = response.data || []
  } catch (error) {
    companies = []
  }

  try {
    const response = await SkillService.getAllSkills()

    skills = response.data || []
  } catch (error) {
    skills = []
  }

  return (
    <Partners
      businessLocations={businessLocations}
      partnerTypes={partnerTypes}
      countriesWithStatesAndCities={countriesWithStatesAndCities}
      companies={companies}
      skills={skills}
    />
  )
}
