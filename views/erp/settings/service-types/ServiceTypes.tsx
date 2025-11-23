'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, ServiceType, Unit } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CreateOrEditServiceTypeModal from './CreateOrEditServiceTypeModal'
import ServiceTypeService from '@/services/api/settings/service_types.service'

const ServiceTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState<string | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

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
      ServiceTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching service types:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching service types:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Service Types'))
  }, [filterOptions])

  // Transform API data to match table format
  const serviceTypesData = apiResponse?.data
    ? apiResponse.data.map((serviceType: ServiceType, index: number) => {
        return {
          id: serviceType.id,
          index: (apiResponse?.from || 1) + index,
          name: serviceType.name,
          is_editable: serviceType?.is_editable ?? 1,
          wasted_percent: serviceType.wasted_percent || 0,
          abbreviation: serviceType.abbreviation || ''
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedServiceTypeId(null)
    setSelectedServiceType(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedServiceTypeId(id)

    // Fetch service type details
    try {
      const response = await ServiceTypeService.show(id)
      setSelectedServiceType(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch service type details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedServiceTypeId(null)
    setSelectedServiceType(null)
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
      id: 'name',
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'wasted_percent',
      header: 'Wasted Percent',
      cell: row => <span className='font-medium'>{row.wasted_percent}</span>,
      sortable: true
    },
    {
      id: 'abbreviation',
      header: 'Abbreviation',
      cell: row => <span className='font-medium'>{row.abbreviation}</span>,
      sortable: true
    },
    {
      id: 'is_editable',
      header: 'Is Editable',
      cell: row => <span className='font-medium'>{row.is_editable ? 'Yes' : 'No'}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <>
          {row.is_editable ? (
            <div className='flex items-center justify-center gap-2'>
              <EditButton tooltip='Edit Service Type Information' onClick={() => handleOpenEditModal(row.id)} variant='icon' />
              <DeleteButton tooltip='Delete Service Type' variant='icon' onClick={() => handleDeleteServiceType(row.id)} />
            </div>
          ) : null}
        </>
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

  const handleDeleteServiceType = async (id: string) => {
    try {
      ServiceTypeService.destroy(id)
        .then(response => {
          toast.success('Service type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete service type')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the service type!')
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
        Add Service Type
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Service Types' noTabs={true}>
        <CommonTable
          data={{
            data: serviceTypesData,
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
          emptyMessage='No service type found'
        />
      </CommonLayout>

      <CreateOrEditServiceTypeModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        serviceTypeId={selectedServiceTypeId || undefined}
        serviceTypeDetails={selectedServiceType || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ServiceTypes
