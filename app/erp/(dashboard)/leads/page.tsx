import ClientSourceService from '@/services/api/client-sources.service'
import CompanyService from '@/services/api/companies.service'
import InterestLevelService from '@/services/api/interest_levels.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import NoteTypeService from '@/services/api/settings/note_types.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import {
  BusinessLocation,
  ClientSource,
  Company,
  ContactType,
  CountryWithStates,
  InterestLevel,
  NoteType,
  ServiceType,
  Staff
} from '@/types'
import Clients from '@/views/erp/clients/Clients'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const [
    interestLevelsRes,
    companiesRes,
    staffsRes,
    clientSourcesRes,
    serviceTypesRes,
    businessLocationsRes,
    noteTypesRes,
    locationsRes,
    contactTypesRes
  ] = await Promise.allSettled([
    InterestLevelService.getAll(),
    CompanyService.getAll(),
    StaffService.getAll(),
    ClientSourceService.getAll(),
    ServiceTypeService.getAll(),
    BusinessLocationService.getAll(),
    NoteTypeService.index(),
    LocationService.index(),
    ContactTypeService.getAll()
  ])

  const interestLevels: InterestLevel[] =
    interestLevelsRes.status === 'fulfilled' ? interestLevelsRes.value.data || [] : []

  const companies: Company[] = companiesRes.status === 'fulfilled' ? companiesRes.value.data || [] : []
  const staffs: Staff[] = staffsRes.status === 'fulfilled' ? staffsRes.value.data || [] : []
  const clientSources: ClientSource[] = clientSourcesRes.status === 'fulfilled' ? clientSourcesRes.value.data || [] : []
  const serviceTypes: ServiceType[] = serviceTypesRes.status === 'fulfilled' ? serviceTypesRes.value.data || [] : []

  const businessLocations: BusinessLocation[] =
    businessLocationsRes.status === 'fulfilled' ? businessLocationsRes.value.data || [] : []

  const noteTypes: NoteType[] = noteTypesRes.status === 'fulfilled' ? noteTypesRes.value.data.data || [] : []

  const countriesWithStatesAndCities: CountryWithStates[] =
    locationsRes.status === 'fulfilled' ? locationsRes.value.data || [] : []

  const contactTypes: ContactType[] = contactTypesRes.status === 'fulfilled' ? contactTypesRes.value.data || [] : []

  return (
    <Clients
      type='lead'
      interestLevels={interestLevels}
      companies={companies}
      staffs={staffs}
      clientSources={clientSources}
      serviceTypes={serviceTypes}
      businessLocations={businessLocations}
      noteTypes={noteTypes}
      countriesWithStatesAndCities={countriesWithStatesAndCities}
      contactTypes={contactTypes}
    />
  )
}
