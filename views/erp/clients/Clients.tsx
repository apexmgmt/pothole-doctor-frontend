'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { DetailsIcon, UserIcon } from '@/public/icons'
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
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { formatDate } from '@/utils/date'
import ClientService from '@/services/api/clients/clients.service'
import { Badge } from '@/components/ui/badge'
import CreateEditClientModal from './CreateEditClientModal'
import ClientDetails from './ClientDetails'
import { hasPermission } from '@/utils/role-permission'
import ChangeLeadStageModal, { LeadStage } from '@/views/erp/clients/ChangeLeadStageModal'
import TableSearch from '@/components/erp/common/TableSearch'

const Clients: React.FC<{
  type: 'lead' | 'customer'
  interestLevels: InterestLevel[]
  companies: Company[]
  staffs: Staff[]
  clients?: Client[]
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
  clients = [],
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

  const [filterOptions, setFilterOptions] = useState<any>(() => {
    const filters = getInitialFilters(searchParams)

    if (filters.client_id) {
      delete filters.client_id
    }

    return filters
  })

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isStageModalOpen, setIsStageModalOpen] = useState<boolean>(false)
  const [stageClientId, setStageClientId] = useState<string | null>(null)
  const [stageClientCurrentStage, setStageClientCurrentStage] = useState<LeadStage | null>(null)
  const [canCreateClient, setCanCreateClient] = useState<boolean>(false)
  const [canEditClient, setCanEditClient] = useState<boolean>(false)
  const [canDeleteClient, setCanDeleteClient] = useState<boolean>(false)

  // Set initial search value from filterOptions and Check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    if (type === 'lead') {
      hasPermission('Create Lead').then(result => setCanCreateClient(result))
      hasPermission('Update Lead').then(result => setCanEditClient(result))
      hasPermission('Delete Lead').then(result => setCanDeleteClient(result))
    } else {
      hasPermission('Create Customer').then(result => setCanCreateClient(result))
      hasPermission('Update Customer').then(result => setCanEditClient(result))
      hasPermission('Delete Customer').then(result => setCanDeleteClient(result))
    }

    // Open client details if client_id is present in URL
    const urlClientId = searchParams.get('client_id')

    if (urlClientId) {
      setSelectedClientId(urlClientId)
      setActiveTab('details')

      ClientService.show(urlClientId)
        .then(response => {
          if (response?.data) {
            setSelectedClient(response.data)
          }
        })
        .catch(() => {})
    }
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
            cell: (row: Client) => {
              const stage = row?.clientable?.stage

              return (
                <Badge variant='secondary' className='capitalize'>
                  {stage ? stage.replace(/-/g, ' ') : 'New'}
                </Badge>
              )
            },
            sortable: false
          }
        ]
      : [
          {
            id: 'status',
            header: 'Status',
            cell: (row: Client) => '',
            sortable: true
          }
        ]),
    {
      id: 'company',
      header: 'Company',
      cell: (row: Client) => <span>{row?.company?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'first_name',
      header: 'First Name',
      cell: (row: Client) => <span>{row.first_name}</span>,
      sortable: true
    },
    {
      id: 'last_name',
      header: 'Last Name',
      cell: (row: Client) => <span>{row.last_name}</span>,
      sortable: true
    },
    {
      id: 'name',
      header: 'Full Name',
      cell: (row: Client) => <span>{`${row.first_name} ${row.last_name}`}</span>,
      sortable: false
    },
    ...(type === 'lead'
      ? [
          {
            id: 'created_at',
            header: 'Date Created',
            cell: (row: Client) => <span>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'days_since_created',
            header: 'Days Since Created',
            cell: (row: Client) => (
              <span>
                {Math.floor((new Date().getTime() - new Date(row.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </span>
            ),
            sortable: false
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span>{row?.contact_type?.name || ''}</span>,
            sortable: false
          },
          {
            id: 'current_status',
            header: 'Current Status',
            cell: (row: Client) => <span></span>,
            sortable: false
          },
          {
            id: 'current_task',
            header: 'Current Task',
            cell: (row: Client) => <span></span>,
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
            cell: (row: Client) => <span>{row?.clientable?.spouse_name}</span>,
            sortable: false
          }
        ]),
    {
      id: 'cell_phone',
      header: 'Cell Phone',
      cell: (row: Client) => <span>{row?.clientable?.cell_phone}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Client) => <span>{row?.email}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: (row: Client) => {
        const parts = [row?.address?.street_address, row?.address?.city?.name, row?.address?.state?.name].filter(
          Boolean
        )

        return <span>{parts.join(', ')}</span>
      },
      sortable: false
    },
    ...(type === 'lead'
      ? []
      : [
          {
            id: 'location',
            header: 'Location',
            cell: (row: Client) => <span>{row?.location?.name}</span>,
            sortable: false
          },
          {
            id: 'added_by',
            header: 'Added By',
            cell: (row: Client) => (
              <span>{row?.added_by ? `${row.added_by.first_name} ${row.added_by.last_name}` : ''}</span>
            ),
            sortable: false
          }
        ]),
    {
      id: 'reference',
      header: 'Sales Rep.',
      cell: row => (
        <span>
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
            cell: (row: Client) => <span>{row?.interest_level?.name || ''}</span>,
            sortable: false
          },
          {
            id: 'created_at',
            header: 'Date Added',
            cell: (row: Client) => <span>{formatDate(row.created_at)}</span>,
            sortable: true
          },
          {
            id: 'contact_type',
            header: 'Contact Type',
            cell: (row: Client) => <span>{row?.contact_type?.name || ''}</span>,
            sortable: false
          },
          {
            id: 'opening_balance',
            header: 'Opening Balance',
            cell: (row: Client) => <span></span>,
            sortable: false
          }
        ]),
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Client) => {
        const actionButtons: React.ReactNode[] = []

        if (type === 'lead' && canEditClient) {
          actionButtons.push(
            <Button
              key='change-stage'
              variant='ghost'
              size='sm'
              type='button'
              className='w-full hover:text-dark hover:bg-white! hover:border-white'
              onClick={() => handleOpenStageModal(row.id, row?.clientable?.stage || null)}
            >
              Stage
            </Button>
          )
        }

        if (canEditClient) {
          actionButtons.push(
            <EditButton
              key='edit-client'
              tooltip={`Edit ${type === 'lead' ? 'Lead' : 'Customer'} Information`}
              onClick={() => handleOpenEditModal(row.id)}
              variant='text'
            />
          )
        }

        if (canDeleteClient) {
          actionButtons.push(
            <DeleteButton
              key='delete-client'
              tooltip={`Delete ${type === 'lead' ? 'Lead' : 'Customer'}`}
              variant='text'
              onClick={() => handleDeleteClient(row.id)}
            />
          )
        }

        return (
          <div className='flex items-center justify-center gap-2'>
            {actionButtons.length > 0 && <ThreeDotButton buttons={actionButtons} />}
          </div>
        )
      },
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
      await ClientService.destroy(id, type)
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

  const handleOpenStageModal = (clientId: string, currentStage: LeadStage | null) => {
    setStageClientId(clientId)
    setStageClientCurrentStage(currentStage)
    setIsStageModalOpen(true)
  }

  const handleStageModalOpenChange = (open: boolean) => {
    setIsStageModalOpen(open)

    if (!open) {
      setStageClientId(null)
      setStageClientCurrentStage(null)
    }
  }

  const handleLeadStageUpdateSuccess = (clientId: string, stage: LeadStage) => {
    setApiResponse(prev => {
      if (!prev) {
        return prev
      }

      return {
        ...prev,
        data: prev.data.map((client: Client) => {
          if (client.id !== clientId) {
            return client
          }

          return {
            ...client,
            clientable: {
              ...(client.clientable || ({} as NonNullable<Client['clientable']>)),
              stage
            }
          }
        })
      }
    })

    setSelectedClient(prev => {
      if (!prev || prev.id !== clientId) {
        return prev
      }

      return {
        ...prev,
        clientable: {
          ...(prev.clientable || ({} as NonNullable<Client['clientable']>)),
          stage
        }
      }
    })
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
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <TableSearch
          value={searchValue}
          onChange={setSearchValue}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='ghost' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear Filters
          </Button>
        )}
      </div>
      {canCreateClient && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add {type === 'lead' ? 'Lead' : 'Customer'}</span>
        </Button>
      )}
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: type === 'lead' ? 'Leads' : 'Customers',
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
    }
  ]

  return (
    <CommonLayout
      title={`${type === 'lead' ? 'Leads' : 'Customers'}${selectedClient ? ` - ${selectedClient?.first_name + ' ' + selectedClient?.last_name}` : ''}`}
      buttons={tabs}
    >
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
          emptyMessage={type === 'lead' ? 'No lead found' : 'No customer found'}
          handleRowSelect={handleRowSelect}
        />
      )}
      {activeTab === 'details' && (
        <ClientDetails
          type={type}
          clientId={selectedClientId}
          canEditClient={canEditClient}
          handleEditClient={() => handleOpenEditModal(selectedClientId ?? '')}
          noteTypes={noteTypes}
          countriesWithStatesAndCities={countriesWithStatesAndCities}
        />
      )}
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
      {type === 'lead' && (
        <ChangeLeadStageModal
          open={isStageModalOpen}
          onOpenChange={handleStageModalOpenChange}
          clientId={stageClientId}
          currentStage={stageClientCurrentStage}
          onSuccess={handleLeadStageUpdateSuccess}
        />
      )}
    </CommonLayout>
  )
}

export default Clients
