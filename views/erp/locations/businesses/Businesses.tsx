'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { BusinessLocation, Column, DataTableApiResponse, Location } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { DetailsIcon, LocationIcon, UserIcon, ExcelIcon } from '@/public/icons'
import BusinessLocationDetails from './BusinessLocationDetails'
import BusinessLocationClients from './BusinessLocationClients'
import BusinessLocationEstimates from './BusinessLocationEstimates'
import BusinessLocationInvoices from './BusinessLocationInvoices'
import BusinessLocationWarehouses from './BusinessLocationWarehouses'
import BusinessLocationEmployees from './BusinessLocationEmployees'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters } from '@/utils/utility'
import CreateOrEditBusinessLocationModal from './CreateOrEditBusinessLocationModal'
import TableSearch from '@/components/erp/common/TableSearch'

const BusinessLocations: React.FC<{
  initialData?: DataTableApiResponse<BusinessLocation> | null
  locations?: Location['countries']
  permissions?: {
    canCreateBusiness: boolean
    canViewBusiness: boolean
    canEditBusiness: boolean
    canDeleteBusiness: boolean
    canManageWarehouse: boolean
    canManageStaff: boolean
    canManageEstimate: boolean
  }
}> = ({ initialData, locations = [], permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('businesses')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<BusinessLocation> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedBusinessLocationId, setSelectedBusinessLocationId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalBusinessLocation, setModalBusinessLocation] = useState<BusinessLocation | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [countriesWithStateAndCities, setCountriesWithStateAndCities] = useState<Location['countries']>(locations)

  const filterOptions = useMemo(() => {
    return getInitialFilters(searchParams)
  }, [searchParams])

  const canCreateLocation = permissions?.canCreateBusiness ?? false
  const canEditLocation = permissions?.canEditBusiness ?? false
  const canDeleteLocation = permissions?.canDeleteBusiness ?? false
  const canViewLocation = permissions?.canViewBusiness ?? false
  const canManageWarehouse = permissions?.canManageWarehouse ?? false
  const canManageStaff = permissions?.canManageStaff ?? false
  const canManageEstimate = permissions?.canManageEstimate ?? false

  useEffect(() => {
    setCountriesWithStateAndCities(locations)
  }, [locations])

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

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

  // Update URL when filters change
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

  useEffect(() => {
    dispatch(setPageTitle('Manage Business Locations'))
  }, [dispatch])

  // Transform API data to match table format
  const businessLocationData = apiResponse?.data
    ? apiResponse.data.map((businessLocation: any, index: number) => ({
        id: businessLocation.id,
        index: (apiResponse?.from || 1) + index,
        name: businessLocation?.name,
        email: businessLocation?.email,
        phone: businessLocation?.phone,
        invoice_prefix: businessLocation?.invoice_prefix,
        street_address: businessLocation?.street_address,
        city: businessLocation?.city?.name || 'N/A',
        state: businessLocation?.state?.name || 'N/A'
      }))
    : []

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
      header: 'Location Title',
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone Number',
      cell: row => <span>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'invoice_prefix',
      header: 'Invoice Prefix',
      cell: row => <span>{row.invoice_prefix}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span>{row.email}</span>,
      sortable: true
    },
    {
      id: 'street_address',
      header: 'Address',
      cell: row => (
        <span>
          {row.street_address}, {row.city}, {row.state}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditLocation || canDeleteLocation) && (
            <ThreeDotButton
              buttons={[
                ...(canEditLocation
                  ? [
                      <EditButton
                        tooltip='Edit Business Location Information'
                        onClick={() => handleEditLocation(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteLocation
                  ? [
                      <DeleteButton
                        tooltip='Delete Business Location'
                        variant='text'
                        onClick={() => handleDeleteBusinessLocation(row.id)}
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
    setIsFilterDrawerOpen(false)
  }

  const handleDeleteBusinessLocation = async (id: string) => {
    try {
      await BusinessLocationService.destroy(id)
        .then(response => {
          toast.success('Business location deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete business location')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the business location!')
    }
  }

  const handleRowSelect = (businessLocation: any) => {
    setSelectedBusinessLocationId(businessLocation?.id || null)
  }

  const handleCreateLocation = () => {
    setModalMode('create')
    setModalBusinessLocation(null)
    setIsModalOpen(true)
  }

  const handleEditLocation = async (id: string) => {
    setModalMode('edit')
    setModalLoading(true)
    setIsModalOpen(true)

    try {
      const response = await BusinessLocationService.show(id)

      setModalLoading(false)
      setModalBusinessLocation(response.data || null)
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to load business location')
      setIsModalOpen(false)
      setModalLoading(false)
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting business locations...`)
      const blob = await BusinessLocationService.exportBusinessLocations(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `business-locations-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`Business locations exported successfully`)
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    }
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex flex-row gap-2 w-full'>
        <Button variant='default' size='sm' className='h-7 bg-light text-bg hover:bg-light/90' onClick={handleExport}>
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>
        <div className='flex items-center gap-2 lg:flex-0 flex-1'>
          <TableSearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder='Search...'
            className='w-full lg:w-80'
          />
          {hasActiveFilters() && (
            <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
              Clear
            </Button>
          )}
        </div>
      </div>
      {canCreateLocation && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleCreateLocation}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Business Location</span>
        </Button>
      )}
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Locations',
      icon: LocationIcon,
      onClick: () => setActiveTab('businesses'),
      isActive: activeTab === 'businesses'
    },

    // {
    //   label: 'Details',
    //   icon: DetailsIcon,
    //   onClick: () => setActiveTab('details'),
    //   isActive: activeTab === 'details',
    //   disabled: !selectedBusinessLocationId
    // },
    ...(canManageStaff
      ? [
          {
            label: 'Employees',
            icon: DetailsIcon,
            onClick: () => setActiveTab('employees'),
            isActive: activeTab === 'employees',
            disabled: !selectedBusinessLocationId
          }
        ]
      : []),
    {
      label: 'Customers',
      icon: UserIcon,
      onClick: () => setActiveTab('customers'),
      isActive: activeTab === 'customers',
      disabled: !selectedBusinessLocationId
    },
    {
      label: 'Leads',
      icon: UserIcon,
      onClick: () => setActiveTab('leads'),
      isActive: activeTab === 'leads',
      disabled: !selectedBusinessLocationId
    },
    ...(canManageEstimate
      ? [
          {
            label: 'Estimates',
            icon: DetailsIcon,
            onClick: () => setActiveTab('estimates'),
            isActive: activeTab === 'estimates',
            disabled: !selectedBusinessLocationId
          }
        ]
      : []),
    {
      label: 'Invoice',
      icon: DetailsIcon,
      onClick: () => setActiveTab('invoice'),
      isActive: activeTab === 'invoice',
      disabled: !selectedBusinessLocationId
    },
    ...(canManageWarehouse
      ? [
          {
            label: 'Warehouses',
            icon: DetailsIcon,
            onClick: () => setActiveTab('warehouses'),
            isActive: activeTab === 'warehouses',
            disabled: !selectedBusinessLocationId
          }
        ]
      : [])
  ]

  return (
    <>
      <CommonLayout title='Business Locations' buttons={tabs}>
        {activeTab === 'businesses' && (
          <CommonTable
            data={{
              data: businessLocationData,
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
            emptyMessage='No business location found'
            handleRowSelect={handleRowSelect}
          />
        )}

        {activeTab === 'details' && selectedBusinessLocationId && (
          <BusinessLocationDetails businessLocationId={selectedBusinessLocationId} fetchData={() => router.refresh()} />
        )}

        {activeTab === 'employees' && selectedBusinessLocationId && (
          <BusinessLocationEmployees locationId={selectedBusinessLocationId} />
        )}

        {activeTab === 'customers' && selectedBusinessLocationId && (
          <BusinessLocationClients locationId={selectedBusinessLocationId} type='customer' />
        )}

        {activeTab === 'leads' && selectedBusinessLocationId && (
          <BusinessLocationClients locationId={selectedBusinessLocationId} type='lead' />
        )}

        {activeTab === 'estimates' && selectedBusinessLocationId && (
          <BusinessLocationEstimates locationId={selectedBusinessLocationId} />
        )}

        {activeTab === 'invoice' && selectedBusinessLocationId && (
          <BusinessLocationInvoices locationId={selectedBusinessLocationId} />
        )}

        {activeTab === 'warehouses' && selectedBusinessLocationId && (
          <BusinessLocationWarehouses locationId={selectedBusinessLocationId} />
        )}
      </CommonLayout>

      <CreateOrEditBusinessLocationModal
        open={isModalOpen}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setModalBusinessLocation(null)
          }

          setIsModalOpen(isOpen)
        }}
        mode={modalMode}
        businessLocationId={modalBusinessLocation?.id?.toString() || null}
        businessLocationDetails={modalBusinessLocation}
        countriesWithStateAndCities={countriesWithStateAndCities}
        isFetching={modalLoading}
        onSuccess={() => {
          router.refresh()
          setModalBusinessLocation(null)
          setIsModalOpen(false)
        }}
      />
    </>
  )
}

export default BusinessLocations
