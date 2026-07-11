import ClientSourceService from '@/services/api/client-sources.service'
import CompanyService from '@/services/api/companies.service'
import InterestLevelService from '@/services/api/interest_levels.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import NoteTypeService from '@/services/api/settings/note_types.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import StaffService from '@/services/api/staff.service'
import ClientService from '@/services/api/clients/clients.service'
import {
  BusinessLocation,
  ClientSource,
  Company,
  ContactType,
  CountryWithStates,
  InterestLevel,
  NoteType,
  ServiceType,
  Staff,
  DataTableApiResponse,
  Client
} from '@/types'
import Clients from '@/views/erp/clients/Clients'
import { hasPermission } from '@/utils/role-permission'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata = {
  title: `Manage Leads | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} leads.`
}

export const dynamic = 'force-dynamic'

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

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

  let responseData: DataTableApiResponse<Client> | null = null

  try {
    const response = await ClientService.index({ ...(resolvedSearchParams as Record<string, string>), type: 'lead' })

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch leads:', error)
  }

  const [canCreateClient, canEditClient, canDeleteClient] = await Promise.all([
    hasPermission('Create Lead'),
    hasPermission('Update Lead'),
    hasPermission('Delete Lead')
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
      initialData={responseData}
      permissions={{ canCreateClient, canEditClient, canDeleteClient }}
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
