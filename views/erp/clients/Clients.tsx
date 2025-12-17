'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, DocumentIcon, MessageIcon, UserIcon } from '@/public/icons'
import { Button } from '@/components/ui/button'
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
  NoteType,
  ServiceType,
  Staff
} from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { toast } from 'sonner'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { formatDate } from '@/utils/date'
import ClientService from '@/services/api/clients/clients.service'
import { Badge } from '@/components/ui/badge'
import CreateEditClientModal from './CreateEditClientModal'
import ClientDetails from './ClientDetails'
import ClientDocuments from './documents/ClientDocuments'
import ClientSmsView from './sms/ClientSms'
import ClientEmails from './emails/ClientEmails'

const Clients: React.FC<{
  type: 'lead' | 'customer'
  interestLevels: InterestLevel[]
  companies: Company[]
  staffs: Staff[]
  clientSources: ClientSource[]
  serviceTypes: ServiceType[]
  businessLocations: BusinessLocation[]
  noteTypes: NoteType[]
  countriesWithStatesAndCities: CountryWithStates[]
  contactTypes: ContactType[]
}> = ({
  type,
  interestLevels,
  companies,
  staffs,
  clientSources,
  serviceTypes,
  businessLocations,
  noteTypes,
  countriesWithStatesAndCities,
  contactTypes
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('clients')
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        // Remove search if empty, otherwise set it
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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      ClientService.index({ ...filterOptions, type: type })
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(`Error fetching ${type === 'lead' ? 'leads' : 'customers'}`)
        })
    } catch (error) {
      setIsLoading(false)
      toast.error(`Something went wrong while fetching ${type === 'lead' ? 'leads' : 'customers'}!`)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle(`Manage ${type === 'lead' ? 'Leads' : 'Customers'}`))
  }, [filterOptions])

  // Column definitions for CommonTable
  const clientColumns: Column[] = [
    ...(type === 'lead'
      ? [
          {
            id: 'stage',
            header: 'Stage',
            cell: (row: Client) => <span className='font-medium'>{''}</span>,
            sortable: false
          }
        ]
      : [
          {
            id: 'status',
            header: 'Status',
            cell: (row: Client) => <span className='font-medium'>{''}</span>,
            sortable: true
          }
        ]),
    {
      id: 'company',
      header: 'Company',
      cell: (row: Client) => <span className='font-medium'>{row?.company?.name || ''}</span>,
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
    {
      id: 'full_name',
      header: 'Full Name',
      cell: (row: Client) => <span className='font-medium'>{`${row.first_name} ${row.last_name}`}</span>,
      sortable: true
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
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || ''}</span>,
            sortable: false
          },
          {
            id: 'current_status',
            header: 'Current Status',
            cell: (row: Client) => <span className='font-medium'>{''}</span>,
            sortable: false
          },
          {
            id: 'current_task',
            header: 'Current Task',
            cell: (row: Client) => <span className='font-medium'>{''}</span>,
            sortable: false
          },
          {
            id: 'desired_services',
            header: 'Service/Interest',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => {
                  return <Badge key={ds.id}>{ds.name}</Badge>
                })}
              </div>
            ),
            sortable: false
          }
        ]
      : [
          {
            id: 'spouse_name',
            header: 'Spouse Name',
            cell: (row: Client) => <span className='font-medium'>{row?.clientable?.spouse_name}</span>,
            sortable: false
          }
        ]),
    {
      id: 'cell_phone',
      header: 'Cell Phone',
      cell: (row: Client) => <span className='font-medium'>{row?.clientable?.cell_phone}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Client) => <span className='font-medium'>{row?.email}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: (row: Client) => {
        const parts = [row?.address?.street_address, row?.address?.city, row?.address?.state].filter(Boolean)
        return <span className='font-medium'>{parts.join(', ')}</span>
      },
      sortable: false
    },
    ...(type === 'lead'
      ? []
      : [
          {
            id: 'location',
            header: 'Location',
            cell: (row: Client) => <span className='font-medium'>{row?.location?.name}</span>,
            sortable: false
          },
          {
            id: 'added_by',
            header: 'Added By',
            cell: (row: Client) => (
              <span className='font-medium'>
                {row?.added_by ? `${row.added_by.first_name} ${row.added_by.last_name}` : ''}
              </span>
            ),
            sortable: false
          }
        ]),
    {
      id: 'reference',
      header: 'Sales Rep.',
      cell: row => (
        <span className='font-medium'>
          {row?.reference?.first_name} {row?.reference?.last_name}
        </span>
      ),
      sortable: false
    },
    ...(type === 'lead'
      ? []
      : [
          {
            id: 'desired_services',
            header: 'Desired Services',
            cell: (row: Client) => (
              <div className='flex flex-wrap gap-1'>
                {row?.desired_services?.map(ds => {
                  return <Badge key={ds.id}>{ds.name}</Badge>
                })}
              </div>
            ),
            sortable: false
          },
          {
            id: 'interest_level',
            header: 'Interest Level',
            cell: (row: Client) => <span className='font-medium'>{row?.interest_level?.name || ''}</span>,
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
            cell: (row: Client) => <span className='font-medium'>{row?.contact_type?.name || ''}</span>,
            sortable: false
          },
          {
            id: 'opening_balance',
            header: 'Opening Balance',
            cell: (row: Client) => <span className='font-medium'>{''}</span>,
            sortable: false
          }
        ]),
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <EditButton
                tooltip={`Edit ${type === 'lead' ? 'Lead' : 'Client'} Information`}
                onClick={() => handleOpenEditModal(row.id)}
                variant='text'
              />,
              <DeleteButton
                tooltip={`Delete ${type === 'lead' ? 'Lead' : 'Client'}`}
                variant='text'
                onClick={() => handleDeleteClient(row.id)}
              />
            ]}
          />
        </div>
      ),
      sortable: false
    }
  ]

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedClientId(null)
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedClientId(id)

    // Fetch partner type details
    try {
      const response = await ClientService.show(id)
      setSelectedClient(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error(`Failed to fetch ${type === 'lead' ? 'lead' : 'client'} details`)
    }
  }

  const handleDeleteClient = async (id: string) => {
    try {
      ClientService.destroy(id, type)
        .then(response => {
          toast.success(`${type === 'lead' ? 'Lead' : 'Client'} deleted successfully`)
          fetchData()
        })
        .catch(error => {
          toast.error(
            typeof error.message === 'string'
              ? error.message
              : `Failed to delete ${type === 'lead' ? 'lead' : 'client'}`
          )
        })
    } catch (error) {
      toast.error(`Something went wrong while deleting the ${type === 'lead' ? 'lead' : 'client'}!`)
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleRowSelect = (client: any) => {
    setSelectedClientId(client?.id || null)
    setSelectedClient(client || null)
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')
    return filterKeys.length > 0
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full'>
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
          <Button variant='ghost' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
            Clear Filters
          </Button>
        )}
      </div>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add {type === 'lead' ? 'Lead' : 'Client'}
      </Button>
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: type === 'lead' ? 'Leads' : 'Clients',
      icon: UserIcon,
      onClick: () => setActiveTab('clients'),
      isActive: activeTab === 'clients'
    },
    {
      label: 'Details',
      icon: DetailsIcon,
      onClick: () => setActiveTab('details'),
      isActive: activeTab === 'details',
      disabled: !selectedClientId
    },
    {
      label: 'Documents',
      icon: DocumentIcon,
      onClick: () => setActiveTab('documents'),
      isActive: activeTab === 'documents',
      disabled: !selectedClientId
    },
    {
      label: 'SMS',
      icon: MessageIcon,
      onClick: () => setActiveTab('sms'),
      isActive: activeTab === 'sms',
      disabled: !selectedClientId
    },
    {
      label: 'Emails',
      icon: MessageIcon,
      onClick: () => setActiveTab('emails'),
      isActive: activeTab === 'emails',
      disabled: !selectedClientId
    },
    {
      label: 'Notes',
      icon: DocumentIcon,
      onClick: () => setActiveTab('notes'),
      isActive: activeTab === 'notes',
      disabled: !selectedClientId
    },
    {
      label: 'Contacts',
      icon: UserIcon,
      onClick: () => setActiveTab('contacts'),
      isActive: activeTab === 'contacts',
      disabled: !selectedClientId
    },
    {
      label: 'Addresses',
      icon: UserIcon,
      onClick: () => setActiveTab('addresses'),
      isActive: activeTab === 'addresses',
      disabled: !selectedClientId
    }
  ]

  return (
    <CommonLayout title={type === 'lead' ? 'Leads' : 'Clients'} buttons={tabs}>
      {activeTab === 'clients' && (
        <CommonTable
          data={{
            data: apiResponse?.data || [],
            per_page: apiResponse?.per_page || 10,
            total: apiResponse?.total || 0,
            from: apiResponse?.from || 1,
            to: apiResponse?.to || 10,
            current_page: apiResponse?.current_page || 1,
            last_page: apiResponse?.last_page || 1
          }}
          columns={clientColumns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={isLoading}
          emptyMessage={type === 'lead' ? 'No lead found' : 'No client found'}
          handleRowSelect={handleRowSelect}
        />
      )}
      {activeTab === 'details' && <ClientDetails type={type} clientId={selectedClientId} />}
      {activeTab === 'documents' && selectedClientId && <ClientDocuments clientId={selectedClientId || ''} />}
      {activeTab === 'sms' && selectedClientId && (
        <ClientSmsView clientId={selectedClientId || ''} client={selectedClient || null} />
      )}
      {activeTab === 'emails' && selectedClientId && (
        <ClientEmails clientId={selectedClientId || ''} client={selectedClient || null} />
      )}
      {/* 
      

      
      {activeTab === 'notes' && selectedLeadId && selectedClientId && (
        <LeadNotes clientId={selectedClientId || ''} noteTypes={noteTypes} />
      )}
      {activeTab === 'contacts' && selectedLeadId && selectedClientId && (
        <LeadContacts clientId={selectedClientId || ''} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      )}
      {activeTab === 'addresses' && selectedLeadId && selectedClientId && (
        <LeadAddresses clientId={selectedClientId || ''} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      )}*/}
      <CreateEditClientModal
        type={type}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        clientId={selectedClientId}
        clientData={selectedClient}
        onSuccess={fetchData}
        interestLevels={interestLevels}
        companies={companies}
        staffs={staffs}
        clientSources={clientSources}
        serviceTypes={serviceTypes}
        businessLocations={businessLocations}
        contactTypes={contactTypes}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
      />
    </CommonLayout>
  )
}

export default Clients
