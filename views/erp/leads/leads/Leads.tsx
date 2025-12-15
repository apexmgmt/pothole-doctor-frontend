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
  ClientSource,
  Column,
  Company,
  CountryWithStates,
  DataTableApiResponse,
  InterestLevel,
  Lead,
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
import LeadService from '@/services/api/leads/leads.service'
import { formatDate } from '@/utils/date'
import CreateEditLeadModal from './CreateEditLeadModal'
import LeadDetails from './LeadDetails'
import LeadDocuments from './documents/LeadDocuments'
import LeadSmsTable from './sms/LeadSms'
import LeadNotes from './notes/LeadNotes'
import LeadContacts from './contacts/LeadContacts'

const Leads: React.FC<{
  interestLevels: InterestLevel[]
  companies: Company[]
  staffs: Staff[]
  clientSources: ClientSource[]
  serviceTypes: ServiceType[]
  businessLocations: BusinessLocation[]
  noteTypes: NoteType[]
  countriesWithStatesAndCities: CountryWithStates[]
}> = ({
  interestLevels,
  companies,
  staffs,
  clientSources,
  serviceTypes,
  businessLocations,
  noteTypes,
  countriesWithStatesAndCities
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('leads')
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
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
      LeadService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching leads:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching leads:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Leads'))
  }, [filterOptions])

  // Transform API data to match table format
  const leadsData = apiResponse?.data
    ? apiResponse.data.map((lead: Lead, index: number) => ({
        id: lead.id,
        index: (apiResponse?.from || 1) + index,
        type: lead?.client?.type || '',
        company: lead?.client?.company?.name || '',
        first_name: lead?.client?.first_name || '',
        last_name: lead?.client?.last_name || '',
        full_name: `${lead?.client?.first_name || ''} ${lead?.client?.last_name || ''}`.trim(),
        email: lead?.client?.email || '',
        phone: lead?.client?.phone || '',
        address: lead.address || '',
        reference:
          lead?.client?.reference?.first_name && lead?.client?.reference?.last_name
            ? `${lead?.client?.reference?.first_name} ${lead?.client?.reference?.last_name}`.trim()
            : '',
        interest_level: lead?.client?.interest_level?.name || '',
        source: lead?.client?.source?.name || '',
        status: lead?.client?.status === 1 ? 'Active' : 'Inactive',
        created_at: lead.created_at,
        days_since_created: Math.floor(
          (new Date().getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
        ),
        updated_at: lead.updated_at,
        client_id: lead?.client?.id || null,
        data: lead
      }))
    : []

  // Column definitions for CommonTable
  const leadColumns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false
    },
    {
      id: 'stage',
      header: 'Stage',
      cell: row => <span className='font-medium'>{''}</span>,
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: row => <span className='font-medium'>{row.company}</span>,
      sortable: false
    },
    {
      id: 'first_name',
      header: 'First Name',
      cell: row => <span className='font-medium'>{row.first_name}</span>,
      sortable: false
    },
    {
      id: 'last_name',
      header: 'Last Name',
      cell: row => <span className='font-medium'>{row.last_name}</span>,
      sortable: false
    },
    {
      id: 'full_name',
      header: 'Full Name',
      cell: row => <span className='font-medium'>{row.full_name}</span>,
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Date Created',
      cell: row => <span className='font-medium'>{formatDate(row.created_at)}</span>,
      sortable: true
    },
    {
      id: 'days_since_created',
      header: 'Day',
      cell: row => <span className='font-medium'>{row.days_since_created}</span>,
      sortable: false
    },
    {
      id: 'source',
      header: 'Lead Source',
      cell: row => <span className='font-medium'>{row.source}</span>,
      sortable: true
    },
    {
      id: 'type',
      header: 'Contact Type',
      cell: row => <span className='font-medium capitalize'>{row.type}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: row => <span className='font-medium'>{row.status}</span>,
      sortable: true
    },
    {
      id: 'interest_level',
      header: 'Interest Level',
      cell: row => <span className='font-medium'>{row.interest_level}</span>,
      sortable: false
    },
    {
      id: 'phone',
      header: 'Cell Phone',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email}</span>,
      sortable: false
    },
    {
      id: 'address',
      header: 'Address',
      cell: row => <span className='font-medium'>{row.address}</span>,
      sortable: false
    },
    {
      id: 'reference',
      header: 'Sales Rep.',
      cell: row => <span className='font-medium'>{row.reference}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <EditButton tooltip='Edit Lead Information' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
              <DeleteButton tooltip='Delete Lead' variant='text' onClick={() => handleDeleteLead(row.id)} />
            ]}
          />
        </div>
      ),
      sortable: false
    }
  ]

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedLeadId(null)
    setSelectedLead(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedLeadId(id)

    // Fetch partner type details
    try {
      const response = await LeadService.show(id)
      setSelectedLead(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch lead details')
    }
  }

  const handleDeleteLead = async (id: string) => {
    try {
      LeadService.destroy(id)
        .then(response => {
          toast.success('Lead deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete lead')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the lead!')
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleRowSelect = (lead: any) => {
    setSelectedLeadId(lead?.id || null)
    setSelectedClientId(lead?.client_id || null)
    setSelectedLead(lead?.data || null)
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
        Add Lead
      </Button>
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Leads',
      icon: UserIcon,
      onClick: () => setActiveTab('leads'),
      isActive: activeTab === 'leads'
    },
    {
      label: 'Details',
      icon: DetailsIcon,
      onClick: () => setActiveTab('details'),
      isActive: activeTab === 'details',
      disabled: !selectedLeadId
    },
    {
      label: 'Documents',
      icon: DocumentIcon,
      onClick: () => setActiveTab('documents'),
      isActive: activeTab === 'documents',
      disabled: !selectedLeadId && !selectedClientId
    },
    {
      label: 'SMS',
      icon: MessageIcon,
      onClick: () => setActiveTab('sms'),
      isActive: activeTab === 'sms',
      disabled: !selectedLeadId && !selectedClientId
    },
    {
      label: 'Notes',
      icon: DocumentIcon,
      onClick: () => setActiveTab('notes'),
      isActive: activeTab === 'notes',
      disabled: !selectedLeadId && !selectedClientId
    },
    {
      label: 'Contacts',
      icon: UserIcon,
      onClick: () => setActiveTab('contacts'),
      isActive: activeTab === 'contacts',
      disabled: !selectedLeadId && !selectedClientId
    }
  ]

  return (
    <CommonLayout title='Leads' buttons={tabs}>
      {activeTab === 'leads' && (
        <CommonTable
          data={{
            data: leadsData,
            per_page: apiResponse?.per_page || 10,
            total: apiResponse?.total || 0,
            from: apiResponse?.from || 1,
            to: apiResponse?.to || 10,
            current_page: apiResponse?.current_page || 1,
            last_page: apiResponse?.last_page || 1
          }}
          columns={leadColumns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No leads found'
          handleRowSelect={handleRowSelect}
        />
      )}

      {activeTab === 'details' && <LeadDetails leadId={selectedLeadId} />}
      {activeTab === 'documents' && selectedLeadId && selectedClientId && (
        <LeadDocuments clientId={selectedClientId || ''} />
      )}
      {activeTab === 'sms' && selectedLeadId && selectedClientId && (
        <LeadSmsTable clientId={selectedClientId || ''} lead={selectedLead || null} />
      )}
      {activeTab === 'notes' && selectedLeadId && selectedClientId && (
        <LeadNotes clientId={selectedClientId || ''} noteTypes={noteTypes} />
      )}
      {activeTab === 'contacts' && selectedLeadId && selectedClientId && (
        <LeadContacts clientId={selectedClientId || ''} countriesWithStatesAndCities={countriesWithStatesAndCities} />
      )}
      <CreateEditLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        leadId={selectedLeadId}
        leadData={selectedLead}
        onSuccess={fetchData}
        interestLevels={interestLevels}
        companies={companies}
        staffs={staffs}
        clientSources={clientSources}
        serviceTypes={serviceTypes}
        businessLocations={businessLocations}
      />
    </CommonLayout>
  )
}

export default Leads
