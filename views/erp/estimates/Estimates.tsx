'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, EstimateType, DataTableApiResponse, Estimate, ServiceType, Client, Staff, PaymentTerm } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import EstimateService from '@/services/api/estimates/estimates.service'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/date'
import CreateOrEditEstimateModal from './CreateOrEditEstimateModal'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import { hasPermission } from '@/utils/role-permission'

const Estimates: React.FC<{
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
}> = ({ serviceTypes, estimateTypes, clients, staffs, paymentTerms }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateEstimate, setCanCreateEstimate] = useState<boolean>(false)
  const [canEditEstimate, setCanEditEstimate] = useState<boolean>(false)
  const [canDeleteEstimate, setCanDeleteEstimate] = useState<boolean>(false)
  const [canViewEstimate, setCanViewEstimate] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Estimate').then(result => setCanCreateEstimate(result))
    hasPermission('Update Estimate').then(result => setCanEditEstimate(result))
    hasPermission('Delete Estimate').then(result => setCanDeleteEstimate(result))
    hasPermission('View Estimate').then(result => setCanViewEstimate(result))
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
      EstimateService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching estimates:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching estimates:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Estimates'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedEstimateId(null)
    setSelectedEstimate(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedEstimateId(id)

    try {
      EstimateService.show(id).then(response => {
        setSelectedEstimate(response.data)
        setIsModalOpen(true)
      })
    } catch (error) {
      setIsModalOpen(false)
      toast.error('Failed to fetch estimate details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedEstimateId(null)
    setSelectedEstimate(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'estimate_number',
      header: 'Estimate#',
      cell: row => <span className='font-medium'>{row.estimate_number?.toString().padStart(6, '0')}</span>,
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Estimate) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'biding_date',
      header: 'Date',
      cell: (row: Estimate) => <span className='font-medium'>{formatDate(row?.biding_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Estimate) => <span className='font-medium'>{row?.client?.company?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Estimate) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: true
    },
    {
      id: 'location',
      header: 'Job Address',
      cell: (row: Estimate) => <span className='font-medium'>{row.location}</span>,
      sortable: true
    },
    {
      id: 'service_type',
      header: 'Service Type',
      cell: (row: Estimate) => <span className='font-medium'>{row?.service_type?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: row => (
        <Badge
          key={row.id}
          variant={row.status === 'Completed' ? 'default' : row.status === 'In Progress' ? 'secondary' : 'destructive'}
          className='mr-1 mb-1'
        >
          {row.status}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditEstimate || canViewEstimate || canDeleteEstimate) && (
            <ThreeDotButton
              buttons={[
                ...(canViewEstimate
                  ? [<ViewButton tooltip='View Estimate Details' link={`/erp/estimates/${row.id}`} variant='text' />]
                  : []),
                ...(canEditEstimate
                  ? [
                      <EditButton
                        tooltip='Edit Estimate Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteEstimate
                  ? [
                      <DeleteButton
                        tooltip='Delete Estimate'
                        variant='text'
                        onClick={() => handleDeleteEstimate(row.id)}
                      />
                    ]
                  : [])
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteEstimate = async (id: string) => {
    try {
      EstimateService.destroy(id)
        .then(response => {
          toast.success('Estimate deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete estimate')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the estimate!')
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
      {canCreateEstimate && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Estimate
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Estimates' noTabs={true}>
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
          columns={columns}
          customFilters={customFilters}
          setFilterOptions={setFilterOptions}
          showFilters={true}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No estimate found'
        />
      </CommonLayout>

      <CreateOrEditEstimateModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        estimateId={selectedEstimateId || undefined}
        estimateDetails={selectedEstimate || undefined}
        onSuccess={handleSuccess}
        serviceTypes={serviceTypes}
        estimateTypes={estimateTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
      />
    </>
  )
}

export default Estimates
