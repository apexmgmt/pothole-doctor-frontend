'use client'

import React, { useState, useEffect } from 'react'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import {
  BusinessLocation,
  Client,
  ClientSource,
  Column,
  Company,
  ContactType,
  CountryWithStates,
  DataTableApiResponse,
  InterestLevel,
  ServiceType,
  Staff
} from '@/types'
import { formatDate } from '@/utils/date'
import ClientService from '@/services/api/clients/clients.service'
import InterestLevelService from '@/services/api/interest_levels.service'
import CompanyService from '@/services/api/companies.service'
import StaffService from '@/services/api/staff.service'
import ClientSourceService from '@/services/api/client-sources.service'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import LocationService from '@/services/api/locations/location.service'
import CreateEditClientModal from '@/views/erp/clients/CreateEditClientModal'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocationClients: React.FC<{
  locationId: string
  type: 'customer' | 'lead'
}> = ({ locationId, type }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [canEditClient, setCanEditClient] = useState<boolean>(false)
  const [canDeleteClient, setCanDeleteClient] = useState<boolean>(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isLoadingModalData, setIsLoadingModalData] = useState<boolean>(false)

  // Modal data (lazy-loaded)
  const [interestLevels, setInterestLevels] = useState<InterestLevel[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [clientSources, setClientSources] = useState<ClientSource[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])
  const [contactTypes, setContactTypes] = useState<ContactType[]>([])
  const [countriesWithStatesAndCities, setCountriesWithStatesAndCities] = useState<CountryWithStates[]>([])
  const [modalDataLoaded, setModalDataLoaded] = useState<boolean>(false)

  // Check permissions on mount
  useEffect(() => {
    if (type === 'lead') {
      hasPermission('Update Lead').then(result => setCanEditClient(result))
      hasPermission('Delete Lead').then(result => setCanDeleteClient(result))
    } else {
      hasPermission('Update Customer').then(result => setCanEditClient(result))
      hasPermission('Delete Customer').then(result => setCanDeleteClient(result))
    }
  }, [type])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev }

        if (searchValue && searchValue.trim() !== '') {
          newOptions.search = searchValue
        } else {
          delete newOptions.search
        }

        if (newOptions.page) {
          delete newOptions.page
        }

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    ClientService.index({ ...filterOptions, type, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error(`Failed to fetch ${type === 'lead' ? 'leads' : 'customers'}`)
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const fetchModalData = async () => {
    if (modalDataLoaded) return

    setIsLoadingModalData(true)

    try {
      const [
        interestLevelsRes,
        companiesRes,
        staffsRes,
        clientSourcesRes,
        serviceTypesRes,
        businessLocationsRes,
        contactTypesRes,
        locationsRes
      ] = await Promise.allSettled([
        InterestLevelService.getAll(),
        CompanyService.getAll(),
        StaffService.getAll(),
        ClientSourceService.getAll(),
        ServiceTypeService.getAll(),
        BusinessLocationService.getAll(),
        ContactTypeService.getAll(),
        LocationService.index()
      ])

      if (interestLevelsRes.status === 'fulfilled') setInterestLevels(interestLevelsRes.value.data || [])
      if (companiesRes.status === 'fulfilled') setCompanies(companiesRes.value.data || [])
      if (staffsRes.status === 'fulfilled') setStaffs(staffsRes.value.data || [])
      if (clientSourcesRes.status === 'fulfilled') setClientSources(clientSourcesRes.value.data || [])
      if (serviceTypesRes.status === 'fulfilled') setServiceTypes(serviceTypesRes.value.data || [])
      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])
      if (contactTypesRes.status === 'fulfilled') setContactTypes(contactTypesRes.value.data || [])
      if (locationsRes.status === 'fulfilled') setCountriesWithStatesAndCities(locationsRes.value.data || [])

      setModalDataLoaded(true)
    } catch {
      toast.error('Failed to load form data')
    } finally {
      setIsLoadingModalData(false)
    }
  }

  const handleOpenEditModal = async (id: string) => {
    setSelectedClientId(id)
    setModalMode('edit')

    await fetchModalData()

    try {
      const response = await ClientService.show(id)

      setSelectedClient(response.data)
      setIsModalOpen(true)
    } catch {
      toast.error(`Failed to fetch ${type === 'lead' ? 'lead' : 'client'} details`)
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      await ClientService.destroy(id, type)
      toast.success(`${type === 'lead' ? 'Lead' : 'Client'} deleted successfully`)
      fetchData()
    } catch (error: any) {
      toast.error(
        typeof error.message === 'string' ? error.message : `Failed to delete ${type === 'lead' ? 'lead' : 'client'}`
      )
    }
  }

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (_row: Client, rowIndex: number | undefined) => {
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Client) => <span className='font-medium'>{row?.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'first_name',
      header: 'First Name',
      cell: (row: Client) => <span className='font-medium'>{row.first_name}</span>,
      sortable: false
    },
    {
      id: 'last_name',
      header: 'Last Name',
      cell: (row: Client) => <span className='font-medium'>{row.last_name}</span>,
      sortable: false
    },
    ...(type === 'lead'
      ? [
          {
            id: 'created_at',
            header: 'Date Created',
            cell: (row: Client) => <span className='font-medium'>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'days_since_created',
            header: 'Days Since Created',
            cell: (row: Client) => (
              <span className='font-medium'>
                {Math.floor((new Date().getTime() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            ),
            sortable: false
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || '—'}</span>,
            sortable: false
          },
          {
            id: 'desired_services',
            header: 'Service/Interest',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => (
                  <Badge key={ds.id}>{ds.name}</Badge>
                ))}
              </div>
            ),
            sortable: false
          }
        ]
      : [
          {
            id: 'spouse_name',
            header: 'Spouse Name',
            cell: (row: Client) => <span className='font-medium'>{row?.clientable?.spouse_name || '—'}</span>,
            sortable: false
          },
          {
            id: 'added_by',
            header: 'Added By',
            cell: (row: Client) => (
              <span className='font-medium'>
                {row?.added_by ? `${row.added_by.first_name} ${row.added_by.last_name}` : '—'}
              </span>
            ),
            sortable: false
          },
          {
            id: 'desired_services',
            header: 'Desired Services',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => (
                  <Badge key={ds.id}>{ds.name}</Badge>
                ))}
              </div>
            ),
            sortable: false
          },
          {
            id: 'interest_level',
            header: 'Interest Level',
            cell: (row: Client) => <span className='font-medium'>{row?.interest_level?.name || '—'}</span>,
            sortable: false
          },
          {
            id: 'created_at',
            header: 'Date Added',
            cell: (row: Client) => <span className='font-medium'>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || '—'}</span>,
            sortable: false
          }
        ]),
    {
      id: 'cell_phone',
      header: 'Cell Phone',
      cell: (row: Client) => <span className='font-medium'>{row?.clientable?.cell_phone || '—'}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Client) => <span className='font-medium'>{row?.email || '—'}</span>,
      sortable: true
    },
    {
      id: 'reference',
      header: 'Sales Rep.',
      cell: (row: Client) => (
        <span className='font-medium'>
          {row?.reference ? `${row.reference.first_name} ${row.reference.last_name}` : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Client) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditClient || canDeleteClient) && (
            <ThreeDotButton
              buttons={[
                canEditClient && (
                  <EditButton
                    tooltip={`Edit ${type === 'lead' ? 'Lead' : 'Customer'} Information`}
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeleteClient && (
                  <DeleteButton
                    tooltip={`Delete ${type === 'lead' ? 'Lead' : 'Customer'}`}
                    variant='text'
                    onClick={() => handleDeleteClient(row.id)}
                  />
                )
              ]}
            />
          )}
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const customFilters = (
    <div className='flex items-center gap-2'>
      <InputGroup>
        <InputGroupInput
          placeholder='Search...'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className='w-80'
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      {hasActiveFilters() && (
        <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
          Clear
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as Client[]) || [],
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        columns={columns}
        customFilters={customFilters}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage={`No ${type === 'lead' ? 'leads' : 'customers'} found for this location`}
      />

      {isModalOpen && (
        <CreateEditClientModal
          type={type}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedClient(null)
            setSelectedClientId(null)
          }}
          mode={modalMode}
          clientId={selectedClientId}
          clientData={selectedClient}
          onSuccess={() => {
            setIsModalOpen(false)
            fetchData()
          }}
          interestLevels={interestLevels}
          companies={companies}
          staffs={staffs}
          clientSources={clientSources}
          serviceTypes={serviceTypes}
          businessLocations={businessLocations}
          contactTypes={contactTypes}
          countriesWithStatesAndCities={countriesWithStatesAndCities}
        />
      )}
    </>
  )
}

export default BusinessLocationClients
