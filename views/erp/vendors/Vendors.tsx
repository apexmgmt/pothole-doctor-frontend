'use client'

import React, { useState, useEffect, useMemo } from 'react'

import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, User2Icon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Vendor, VendorsProps } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import VendorService from '@/services/api/vendors/vendors.service'
import { DetailsIcon, UserIcon } from '@/public/icons'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CreateOrEditVendorModal from './CreateOrEditVendorModal'
import VendorDetails from './VendorDetails'
import TableSearch from '@/components/erp/common/TableSearch'

const Vendors: React.FC<VendorsProps> = ({
  taxTypes,
  countriesWithStatesAndCities,
  paymentTerms,
  initialData,
  permissions
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Vendor> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeTab, setActiveTab] = useState<string>('vendors')
  const filterOptions = useMemo(() => getInitialFilters(searchParams), [searchParams])
  const canCreateVendor = permissions?.canCreateVendor ?? false
  const canEditVendor = permissions?.canEditVendor ?? false
  const canDeleteVendor = permissions?.canDeleteVendor ?? false
  const canViewVendor = permissions?.canViewVendor ?? false

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Vendors'))
  }, [])

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

  // Transform API data to match table format
  const vendorsData = apiResponse?.data
    ? apiResponse.data.map((vendor: Vendor, index: number) => {
        const userable = vendor.userable

        return {
          id: vendor.id,
          index: (apiResponse?.from || 1) + index,
          name: vendor.first_name,
          phone: userable?.phone || 'N/A',
          address: userable?.street_address + ', ' + userable?.city?.name + ', ' + userable?.state?.name || 'N/A',
          profit_margin: userable?.profit_margin || 0,
          is_enable_b2b: userable?.is_enable_b2b ? 'Yes' : 'No',
          userable_id: vendor.userable_id || null
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedVendorId(null)
    setSelectedVendor(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedVendorId(id)

    // Fetch contact type details
    try {
      const response = await VendorService.show(id)

      setSelectedVendor(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch partner details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedVendorId(null)
    setSelectedVendor(null)
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
      id: 'name',
      header: 'Vendor Name',
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Full Address',
      cell: row => <span>{row.address}</span>,
      sortable: true
    },
    {
      id: 'profit_margin',
      header: 'Profit Margin (%)',
      cell: row => <span>{row.profit_margin}</span>,
      sortable: false
    },
    {
      id: 'is_enable_b2b',
      header: 'B2B Enabled',
      cell: row => <span>{row.is_enable_b2b}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditVendor || canDeleteVendor) && (
            <ThreeDotButton
              buttons={[
                <EditButton
                  tooltip='Edit Vendor Information'
                  onClick={() => handleOpenEditModal(row.id)}
                  variant='text'
                />,
                <DeleteButton tooltip='Delete Vendor' variant='text' onClick={() => handleDeleteVendor(row.id)} />
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

  const handleDeleteVendor = async (id: string) => {
    try {
      await VendorService.destroy(id)
        .then(response => {
          toast.success('Vendor deleted successfully')
          router.refresh()
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
      {canCreateVendor && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Vendor</span>
        </Button>
      )}
    </div>
  )

  // Button configuration for CommonLayout
  const tabs = [
    {
      label: 'Vendors',
      icon: UserIcon,
      onClick: () => setActiveTab('vendors'),
      isActive: activeTab === 'vendors'
    },
    ...(canViewVendor
      ? [
          {
            label: 'Details',
            icon: DetailsIcon,
            onClick: () => setActiveTab('details'),
            isActive: activeTab === 'details',
            disabled: !selectedVendorId
          }
        ]
      : [])
  ]

  const handleRowSelect = (partner: any) => {
    setSelectedVendorId(partner?.id || null)
  }

  return (
    <>
      <CommonLayout title='Vendors' buttons={tabs}>
        {activeTab === 'vendors' && (
          <CommonTable
            data={{
              data: vendorsData,
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
            emptyMessage='No vendor found'
          />
        )}

        {activeTab === 'details' && selectedVendorId && (
          <VendorDetails
            vendorId={selectedVendorId}
            onEdit={vendor => handleOpenEditModal(vendor.id)}
            countriesWithStatesAndCities={countriesWithStatesAndCities}
          />
        )}
      </CommonLayout>

      <CreateOrEditVendorModal
        paymentTerms={paymentTerms}
        taxTypes={taxTypes}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        vendorId={selectedVendorId || undefined}
        vendorDetails={selectedVendor || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default Vendors
