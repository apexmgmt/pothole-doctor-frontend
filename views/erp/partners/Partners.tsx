'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Partner, PartnersProps } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import PartnerService from '@/services/api/partners/partners.service'
import CreateOrEditPartnerModal from './CreateOrEditPartnerModal'
import { DetailsIcon, DocumentIcon, UserIcon } from '@/public/icons'

const Partners: React.FC<PartnersProps> = ({
  businessLocations,
  partnerTypes,
  countriesWithStatesAndCities,
  companies,
  skills
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeTab, setActiveTab] = useState<string>('partners')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

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
      PartnerService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching contact types')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching partners')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Contractors/Subcontractors'))
  }, [filterOptions])

  // Transform API data to match table format
  const partnersData = apiResponse?.data
    ? apiResponse.data.map((partner: Partner, index: number) => {
        return {
          id: partner.id,
          index: (apiResponse?.from || 1) + index,
          name: partner?.user?.first_name + ' ' + partner?.user.last_name,
          company: partner?.company?.name || '',
          email: partner?.user?.email,
          phone: partner.phone,
          partner_type: partner?.partner_type?.name,
          skills: partner?.skills.length > 0 ? partner.skills.map(skill => skill.name).join(', ') : 'N/A',
          insurance_expiration: partner.insurance_expiration
            ? new Date(partner.insurance_expiration).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })
            : '',
          w9_expiration: partner.w9_expiration
            ? new Date(partner.w9_expiration).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              })
            : ''
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedPartnerId(null)
    setSelectedPartner(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedPartnerId(id)

    // Fetch contact type details
    try {
      const response = await PartnerService.show(id)
      setSelectedPartner(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch partner details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPartnerId(null)
    setSelectedPartner(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'first_name',
      header: 'Full Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company Name',
      cell: row => <span className='font-medium'>{row.company}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'partner_type',
      header: 'Partner Type',
      cell: row => <span className='font-medium'>{row.partner_type}</span>,
      sortable: false
    },
    {
      id: 'skills',
      header: 'Skills',
      cell: row => <span className='font-medium wrap-normal'>{row.skills}</span>,
      sortable: false
    },
    {
      id: 'insurance_expiration',
      header: 'Insurance Expiration',
      cell: row => <span className='font-medium'>{row.insurance_expiration}</span>,
      sortable: false
    },
    {
      id: 'w9_expiration',
      header: 'W9 Expiration',
      cell: row => <span className='font-medium'>{row.w9_expiration}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Partner Information' onClick={() => handleOpenEditModal(row.id)} variant='icon' />
          <DeleteButton tooltip='Delete Partner' variant='icon' onClick={() => handleDeletePartner(row.id)} />
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeletePartner = async (id: string) => {
    try {
      PartnerService.destroy(id)
        .then(response => {
          toast.success('Partner deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete partner')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the partner!')
    }
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
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light'>
            Clear
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
        Add Contractor/Subcontractor
      </Button>
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Contractors/Subcontractors',
      icon: UserIcon,
      onClick: () => setActiveTab('partners'),
      isActive: activeTab === 'partners'
    },
    {
      label: 'Documents',
      icon: DocumentIcon,
      onClick: () => setActiveTab('documents'),
      isActive: activeTab === 'documents',
      disabled: !selectedPartnerId
    }
  ]

  const handleRowSelect = (partner: any) => {
    setSelectedPartnerId(partner?.id || null)
  }

  return (
    <>
      <CommonLayout title='Contractors/Subcontractors' buttons={tabs}>
        {activeTab === 'partners' && (
          <CommonTable
            data={{
              data: partnersData,
              per_page: apiResponse?.per_page || 10,
              total: apiResponse?.total || 0,
              from: apiResponse?.from || 1,
              to: apiResponse?.to || 10,
              current_page: apiResponse?.current_page || 1,
              last_page: apiResponse?.last_page || 1
            }}
            handleRowSelect={handleRowSelect}
            columns={columns}
            customFilters={customFilters}
            setFilterOptions={setFilterOptions}
            showFilters={true}
            pagination={true}
            isLoading={isLoading}
            emptyMessage='No contractor/subcontractor found'
          />
        )}
      </CommonLayout>

      <CreateOrEditPartnerModal
        skills={skills}
        companies={companies}
        businessLocations={businessLocations}
        partnerTypes={partnerTypes}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        partnerId={selectedPartnerId || undefined}
        partnerDetails={selectedPartner || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Partners
