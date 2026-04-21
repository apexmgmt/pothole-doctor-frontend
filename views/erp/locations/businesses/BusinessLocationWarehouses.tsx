'use client'

import React, { useState, useEffect } from 'react'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BusinessLocation, Column, CountryWithStates, DataTableApiResponse, Warehouse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import WarehouseService from '@/services/api/warehouses.service'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import CreateOrEditWarehouseModal from '@/views/erp/warehouses/CreateOrEditWarehouseModal'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocationWarehouses: React.FC<{ locationId: string }> = ({ locationId }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [canEditWarehouse, setCanEditWarehouse] = useState<boolean>(false)
  const [canDeleteWarehouse, setCanDeleteWarehouse] = useState<boolean>(false)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)

  // Modal data (lazy-loaded)
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([])
  const [countriesWithStateAndCities, setCountriesWithStateAndCities] = useState<CountryWithStates[]>([])
  const [modalDataLoaded, setModalDataLoaded] = useState<boolean>(false)

  useEffect(() => {
    hasPermission('Update Warehouse').then(result => setCanEditWarehouse(result))
    hasPermission('Delete Warehouse').then(result => setCanDeleteWarehouse(result))
  }, [])

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

    WarehouseService.index({ ...filterOptions, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error('Failed to fetch warehouses')
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const fetchModalData = async () => {
    if (modalDataLoaded) return

    try {
      const [businessLocationsRes, locationsRes] = await Promise.allSettled([
        BusinessLocationService.getAll(),
        LocationService.index()
      ])

      if (businessLocationsRes.status === 'fulfilled') setBusinessLocations(businessLocationsRes.value.data || [])
      if (locationsRes.status === 'fulfilled') setCountriesWithStateAndCities(locationsRes.value.data || [])

      setModalDataLoaded(true)
    } catch {
      toast.error('Failed to load form data')
    }
  }

  const handleOpenEditModal = async (id: string) => {
    setSelectedWarehouseId(id)
    await fetchModalData()

    try {
      const response = await WarehouseService.show(id)

      setSelectedWarehouse(response.data)
      setIsModalOpen(true)
    } catch {
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

  const handleDeleteWarehouse = async (id: string) => {
    try {
      await WarehouseService.destroy(id)
      toast.success('Warehouse deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete warehouse')
    }
  }

  const columns: Column[] = [
    {
      id: 'locations',
      header: 'Accessible Locations',
      cell: (row: Warehouse) => (
        <span className='flex flex-wrap gap-1'>
          {row.locations?.map((location: BusinessLocation) => (
            <Badge key={location.id || location.name} variant='secondary'>
              {location.name}
            </Badge>
          ))}
        </span>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Warehouse Title',
      cell: (row: Warehouse) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row: Warehouse) => <span className='font-medium'>{row.phone}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Warehouse) => <span className='font-medium'>{row.email}</span>,
      sortable: false
    },
    {
      id: 'address',
      header: 'Address',
      cell: (row: Warehouse) => (
        <span className='font-medium'>
          {row.street ? `${row.street}, ` : ''}
          {row.city ? row.city.name : ''}
          {row.state ? `, ${row.state.name}` : ''}
          {row.zip_code ? ` ${row.zip_code}` : ''}
        </span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Warehouse) => (
        <div className='flex items-center justify-center gap-2'>
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
          data: (apiResponse?.data as Warehouse[]) || [],
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
        emptyMessage='No warehouses found for this location'
      />

      <CreateOrEditWarehouseModal
        mode='edit'
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

export default BusinessLocationWarehouses
