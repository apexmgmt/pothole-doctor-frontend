'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import {
  Column,
  EstimateType,
  DataTableApiResponse,
  Estimate,
  ServiceType,
  Client,
  Staff,
  PaymentTerm,
  BusinessLocation
} from '@/types'
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
import { Description } from '@/components/ui/description'
import Link from 'next/link'
import TableSearch from '@/components/erp/common/TableSearch'

const Estimates: React.FC<{
  serviceTypes: ServiceType[]
  estimateTypes: EstimateType[]
  clients: Client[]
  staffs: Staff[]
  paymentTerms: PaymentTerm[]
  businessLocations: BusinessLocation[]
  initialData?: DataTableApiResponse<Estimate> | null
  permissions?: {
    canCreateEstimate: boolean
    canViewEstimate: boolean
    canEditEstimate: boolean
    canDeleteEstimate: boolean
  }
}> = ({ serviceTypes, estimateTypes, clients, staffs, paymentTerms, businessLocations, initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Estimate> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedEstimateId, setSelectedEstimateId] = useState<string | null>(null)
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const filterOptions = useMemo(() => getInitialFilters(searchParams), [searchParams])
  const canCreateEstimate = permissions?.canCreateEstimate ?? false
  const canEditEstimate = permissions?.canEditEstimate ?? false
  const canDeleteEstimate = permissions?.canDeleteEstimate ?? false
  const canViewEstimate = permissions?.canViewEstimate ?? false

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Estimates'))
  }, [])

  const setFilterOptions = (updater: any) => {
    const currentFilters = getInitialFilters(searchParams)
    const nextFilters = typeof updater === 'function' ? updater(currentFilters) : updater

    const params = new URLSearchParams()

    Object.keys(nextFilters).forEach(key => {
      if (nextFilters[key] !== null && nextFilters[key] !== undefined && nextFilters[key] !== '') {
        params.set(key, String(nextFilters[key]))
      }
    })

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    setIsLoading(true)
    router.push(newUrl, { scroll: false })
  }

  // Debounced search setup
  const debouncedSearch = useMemo(
    () =>
      debounce((val: string) => {
        setFilterOptions((prev: any) => {
          const newOptions = { ...prev }

          if (val && val.trim() !== '') {
            newOptions.search = val
          } else {
            delete newOptions.search
          }

          if (newOptions.page) {
            delete newOptions.page
          }

          return newOptions
        })
      }, 500),
    []
  )

  const onSearchChange = (value: string) => {
    setSearchValue(value)
    debouncedSearch(value)
  }



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
    router.refresh()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'estimate_number',
      header: 'Estimate#',
      cell: row => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          <span className='hover:underline'>{row.estimate_number?.toString()}</span>
        </Link>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row.title}
        </Link>
      ),
      sortable: true
    },
    {
      id: 'biding_date',
      header: 'Date',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {formatDate(row?.biding_date) || ''}
        </Link>
      ),
      sortable: true
    },
    {
      id: 'estimate_type',
      header: 'Estimate Type',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row?.estimate_type?.name || ''}
        </Link>
      ),
      sortable: false
    },
    {
      id: 'location',
      header: 'Location',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row?.location?.name || ''}
        </Link>
      ),
      sortable: false
    },
    {
      id: 'assign_user',
      header: 'Assigned To',
      cell: (row: Estimate) => {
        const parts = [row?.assign_user?.first_name, row?.assign_user?.last_name].filter(Boolean)

        return (
          <Link href={`/erp/estimates/${row.id}`} prefetch>
            {parts.join(' ') || ''}
          </Link>
        )
      },
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row?.client?.company?.name || ''}
        </Link>
      ),
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Estimate) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)
        const name = parts.join(' ') || ''

        if (row?.client?.id) {
          return (
            <Link href={`/erp/customers?client_id=${row.client.id}`} className='hover:underline cursor-pointer'>
              {name}
            </Link>
          )
        }

        return <span>{name}</span>
      },
      sortable: false
    },
    {
      id: 'payment_term',
      header: 'Payment Term',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row?.payment_term?.name || ''}
        </Link>
      ),
      sortable: false
    },
    {
      id: 'tax_rate',
      header: 'Tax Rate',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          {row.tax_rate != null ? `${row.tax_rate}%` : ''}
        </Link>
      ),
      sortable: false
    },
    {
      id: 'address',
      header: 'Job Address',
      cell: (row: Estimate) => (
        <Link href={`/erp/estimates/${row.id}`} prefetch>
          <Description
            description={
              row.address
                ? `${row.address.street_address}, ${row.address.city?.name}, ${row.address.state?.name} ${row.address.zip_code}`
                : ''
            }
          />
        </Link>
      ),
      sortable: false
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
      await EstimateService.destroy(id)
        .then(response => {
          toast.success('Estimate deleted successfully')
          router.refresh()
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
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <TableSearch
          value={searchValue}
          onChange={onSearchChange}
          placeholder='Search...'
          className='lg:w-80 min-w-0'
        />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateEstimate && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Estimate</span>
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
        businessLocations={businessLocations}
      />
    </>
  )
}

export default Estimates
