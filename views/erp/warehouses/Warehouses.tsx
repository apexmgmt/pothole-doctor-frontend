'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { BusinessLocation, Column, DataTableApiResponse, Warehouse, WarehousesProps } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import WarehouseService from '@/services/api/warehouses.service'
import { Badge } from '@/components/ui/badge'
import CreateOrEditWarehouseModal from './CreateOrEditWarehouseModal'
import TableSearch from '@/components/erp/common/TableSearch'
import WarehousePurchaseOrders from './WarehousePurchaseOrders'

type Permissions = {
  canCreateWarehouse: boolean
  canViewWarehouse: boolean
  canEditWarehouse: boolean
  canDeleteWarehouse: boolean
  canManagePurchaseOrder: boolean
}

const Warehouses: React.FC<WarehousesProps & { permissions?: Permissions }> = ({
  businessLocations,
  countriesWithStateAndCities,
  initialData,
  permissions: {
    canCreateWarehouse = false,
    canViewWarehouse = false,
    canEditWarehouse = false,
    canDeleteWarehouse = false,
    canManagePurchaseOrder = false
  } = {}
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Warehouse> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'warehouses' | 'purchase_orders'>('warehouses')
  const [selectedWarehouseRow, setSelectedWarehouseRow] = useState<{ id: string; title: string } | null>(null)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const filterOptions = useMemo(() => {
    return getInitialFilters(searchParams)
  }, [searchParams])

  const setFilterOptions = (updater: any) => {
    const currentFilters = filterOptions
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

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    dispatch(setPageTitle('Warehouses'))
  }, [dispatch])

  // Debounced search update
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
    router.refresh()
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
      cell: row => <span>{row.title}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span>{row.email}</span>,
      sortable: true
    },
    {
      id: 'fax_number',
      header: 'Fax Number',
      cell: row => <span>{row.fax_number}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: row => (
        <span>
          {row.street ? `${row.street}, ` : ''}
          {row.city}, {row.state}, {row.zip_code}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <>
          {(canEditWarehouse || canDeleteWarehouse) && (
            <ThreeDotButton
              buttons={[
                canEditWarehouse && (
                  <EditButton
                    tooltip='Edit Warehouse Information'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeleteWarehouse && (
                  <DeleteButton
                    tooltip='Delete Warehouse'
                    variant='text'
                    onClick={() => handleDeleteWarehouse(row.id)}
                  />
                )
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
      await WarehouseService.destroy(id)
        .then(response => {
          toast.success('Warehouse deleted successfully')
          router.refresh()
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
      {canCreateWarehouse && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Warehouse</span>
        </Button>
      )}
    </div>
  )

  const tabs = [
    {
      label: 'Warehouses',
      onClick: () => setActiveTab('warehouses'),
      isActive: activeTab === 'warehouses'
    },
    ...(canManagePurchaseOrder
      ? [
          {
            label: selectedWarehouseRow ? `Purchase Orders (${selectedWarehouseRow.title})` : 'Purchase Orders',
            onClick: () => selectedWarehouseRow && setActiveTab('purchase_orders'),
            isActive: activeTab === 'purchase_orders',
            disabled: !selectedWarehouseRow
          }
        ]
      : [])
  ]

  return (
    <>
      <CommonLayout title='Warehouses' buttons={tabs}>
        {activeTab === 'warehouses' && (
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
            handleRowSelect={row => {
              setSelectedWarehouseRow({ id: row.id, title: row.title })
            }}
          />
        )}

        {activeTab === 'purchase_orders' && selectedWarehouseRow && (
          <WarehousePurchaseOrders warehouseId={selectedWarehouseRow.id} />
        )}
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
