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

export default async function LeadsPage() {
  let interestLevels: InterestLevel[] = []
  let companies: Company[] = []
  let staffs: Staff[] = []
  let clientSources: ClientSource[] = []
  let serviceTypes: ServiceType[] = []
  let businessLocations: BusinessLocation[] = []
  let noteTypes: NoteType[] = []
  let countriesWithStatesAndCities: CountryWithStates[] = []
  let contactTypes: ContactType[] = []

  // fetch interest levels
  try {
    const response = await InterestLevelService.getAll()

    interestLevels = response.data || []
  } catch (error) {
    interestLevels = []
  }

  // fetch client sources
  try {
    const response = await CompanyService.getAll()

    companies = response.data || []
  } catch (error) {
    companies = []
  }

  // fetch companies
  try {
    const response = await StaffService.getAll()

    staffs = response.data || []
  } catch (error) {
    staffs = []
  }

  // fetch client sources
  try {
    const response = await ClientSourceService.getAll()

    clientSources = response.data || []
  } catch (error) {
    clientSources = []
  }

  // fetch service types
  try {
    const response = await ServiceTypeService.getAll()

    serviceTypes = response.data || []
  } catch (error) {
    serviceTypes = []
  }

  // fetch business locations
  try {
    const response = await BusinessLocationService.getAll()

    businessLocations = response.data || []
  } catch (error) {
    businessLocations = []
  }

  // fetch note types
  try {
    const response = await NoteTypeService.index()

    noteTypes = response.data.data || []
  } catch (error) {
    noteTypes = []
  }

  // fetch countries with states and cities
  try {
    const response = await LocationService.index()

    countriesWithStatesAndCities = response.data || []
  } catch (error) {
    countriesWithStatesAndCities = []
  }

  // fetch contact types
  try {
    const response = await ContactTypeService.getAll()

    contactTypes = response.data || []
  } catch (error) {
    contactTypes = []
  }

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
