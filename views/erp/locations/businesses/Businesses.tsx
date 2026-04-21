'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import { PlusIcon, Search, UsersIcon, WarehouseIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import { DetailsIcon, InvoiceIcon, LocationIcon, UserIcon } from '@/public/icons'
import BusinessLocationDetails from './BusinessLocationDetails'
import BusinessLocationClients from './BusinessLocationClients'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { getInitialFilters } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocations: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<string>('businesses')
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false)
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedBusinessLocationId, setSelectedBusinessLocationId] = useState<string | null>(null)
  const [selectedBusinessLocation, setSelectedBusinessLocation] = useState<any | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateLocation, setCanCreateLocation] = useState<boolean>(false)
  const [canEditLocation, setCanEditLocation] = useState<boolean>(false)
  const [canDeleteLocation, setCanDeleteLocation] = useState<boolean>(false)
  const [canViewLocation, setCanViewLocation] = useState<boolean>(false)
  const [canManageWarehouse, setCanManageWarehouse] = useState<boolean>(false)
  const [canManageStaff, setCanManageStaff] = useState<boolean>(false)
  const [canManageEstimate, setCanManageEstimate] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Location').then(result => setCanCreateLocation(result))
    hasPermission('Update Location').then(result => setCanEditLocation(result))
    hasPermission('Delete Location').then(result => setCanDeleteLocation(result))
    hasPermission('View Location').then(result => setCanViewLocation(result))
    hasPermission('Manage Warehouse').then(result => setCanManageWarehouse(result))
    hasPermission('Manage Staff').then(result => setCanManageStaff(result))
    hasPermission('Manage Estimate').then(result => setCanManageEstimate(result))
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

  // Update URL when filters change
  const updateURL = (filters: any) => {
    const params = new URLSearchParams()

    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.set(key, String(filters[key]))
      }
    })

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : window.location.pathname

    router.push(newUrl, { scroll: false })
  }

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      BusinessLocationService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching business locations:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching business locations:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(filterOptions)
    dispatch(setPageTitle('Manage Business Locations'))
  }, [filterOptions])

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
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone Number',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'invoice_prefix',
      header: 'Invoice Prefix',
      cell: row => <span className='font-medium'>{row.invoice_prefix}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email}</span>,
      sortable: true
    },
    {
      id: 'street_address',
      header: 'Address',
      cell: row => <span className='font-medium'>{row.street_address}</span>,
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
                        link={`/erp/locations/businesses/${row.id}/edit`}
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
          fetchData()
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
      <Link href='/erp/locations/businesses/create'>
        <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90'>
          <PlusIcon className='w-4 h-4' />
          Add Business Location
        </Button>
      </Link>
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
          <BusinessLocationDetails businessLocationId={selectedBusinessLocationId} fetchData={fetchData} />
        )}

        {activeTab === 'customers' && selectedBusinessLocationId && (
          <BusinessLocationClients locationId={selectedBusinessLocationId} type='customer' />
        )}

        {activeTab === 'leads' && selectedBusinessLocationId && (
          <BusinessLocationClients locationId={selectedBusinessLocationId} type='lead' />
        )}
      </CommonLayout>
    </>
  )
}

export default BusinessLocations
