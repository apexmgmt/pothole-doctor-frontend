import CompanyService from '@/services/api/companies.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import SkillService from '@/services/api/skills.service'
import { BusinessLocation, Company, CountryWithStates, PartnerType, Skill } from '@/types'
import Partners from '@/views/erp/partners/Partners'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const [businessLocationsRes, partnerTypesRes, locationsRes, companiesRes, skillsRes] = await Promise.allSettled([
    BusinessLocationService.getAll(),
    PartnerTypesService.getAll(),
    LocationService.index(),
    CompanyService.getAll(),
    SkillService.getAll()
  ])

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  const partnerTypes: PartnerType[] = partnerTypesRes.status === 'fulfilled' ? partnerTypesRes.value.data || [] : []

  const countriesWithStatesAndCities: CountryWithStates[] =
    locationsRes.status === 'fulfilled' ? locationsRes.value.data || [] : []

  const companies: Company[] = companiesRes.status === 'fulfilled' ? companiesRes.value.data || [] : []
  const skills: Skill[] = skillsRes.status === 'fulfilled' ? skillsRes.value.data || [] : []

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
