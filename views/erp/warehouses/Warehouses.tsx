'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { BusinessLocation, Column, DataTableApiResponse, Warehouse, WarehousesProps } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import WarehouseService from '@/services/api/warehouses.service'
import { Badge } from '@/components/ui/badge'
import CreateOrEditWarehouseModal from './CreateOrEditWarehouseModal'
import { hasPermission } from '@/utils/role-permission'

const Warehouses: React.FC<WarehousesProps> = ({ businessLocations, countriesWithStateAndCities }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateWarehouse, setCanCreateWarehouse] = useState<boolean>(false)
  const [canEditWarehouse, setCanEditWarehouse] = useState<boolean>(false)
  const [canDeleteWarehouse, setCanDeleteWarehouse] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Warehouse').then(result => setCanCreateWarehouse(result))
    hasPermission('Update Warehouse').then(result => setCanEditWarehouse(result))
    hasPermission('Delete Warehouse').then(result => setCanDeleteWarehouse(result))
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
      WarehouseService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch warehouses')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the warehouses!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Warehouses'))
  }, [filterOptions])

  // Transform API data to match table format
  const warehousesData = apiResponse?.data
    ? apiResponse.data.map((warehouse: Warehouse, index: number) => {
        return {
          id: warehouse.id,
          index: (apiResponse?.from || 1) + index,
          title: warehouse.title,
          email: warehouse.email,
          phone: warehouse.phone,
          fax_number: warehouse?.fax_number || ' - ',
          tax_rate: warehouse?.tax_rate ?? 0,
          street: warehouse.street,
          state: warehouse.state ? warehouse.state.name : ' - ',
          city: warehouse.city ? warehouse.city.name : ' - ',
          zip_code: warehouse.zip_code,
          locations: warehouse.locations ?? []
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedWarehouseId(null)
    setSelectedWarehouse(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedWarehouseId(id)

    // Fetch labor cost details
    try {
      const response = await WarehouseService.show(id)

      setSelectedWarehouse(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch warehouse details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedWarehouseId(null)
    setSelectedWarehouse(null)
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
      id: 'locations',
      header: 'Accessible Locations',
      cell: row => (
        <span className='flex flex-wrap gap-1'>
          {row.locations?.map((location: BusinessLocation) => (
            <Badge key={location.id || location.name} variant='secondary'>
              {location.name}
            </Badge>
          ))}
        </span>
      ),
      sortable: true
    },
    {
      id: 'title',
      header: 'Warehouse Title',
      cell: row => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'fax_number',
      header: 'Fax Number',
      cell: row => <span className='font-medium'>{row.fax_number}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: row => (
        <span className='font-medium'>
          {row.street ? `${row.street}, ` : ''}
          {row.city}, {row.state}, {row.zip_code}
        </span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <>
          {(canEditWarehouse || canDeleteWarehouse) && (
            <ThreeDotButton
              buttons={[
                ...(canEditWarehouse
                  ? [
                      <EditButton
                        tooltip='Edit Warehouse Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteWarehouse
                  ? [
                      <DeleteButton
                        tooltip='Delete Warehouse'
                        variant='text'
                        onClick={() => handleDeleteWarehouse(row.id)}
                      />
                    ]
                  : [])
              ]}
            />
          )}
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

  const handleDeleteWarehouse = async (id: string) => {
    try {
      WarehouseService.destroy(id)
        .then(response => {
          toast.success('Warehouse deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete warehouse')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the warehouse!')
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
      {canCreateWarehouse && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Warehouse
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Warehouses' noTabs={true}>
        <CommonTable
          data={{
            data: warehousesData,
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
          emptyMessage='No warehouse found'
        />
      </CommonLayout>

      <CreateOrEditWarehouseModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        businessLocations={businessLocations}
        countriesWithStateAndCities={countriesWithStateAndCities}
        warehouseId={selectedWarehouseId || undefined}
        warehouseDetails={selectedWarehouse || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Warehouses
