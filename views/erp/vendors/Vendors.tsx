'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search, User2Icon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Vendor, VendorsProps } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import VendorService from '@/services/api/vendors/vendors.service'
import { DetailsIcon, DocumentIcon, UserIcon } from '@/public/icons'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CreateOrEditVendorModal from './CreateOrEditVendorModal'
import VendorDetails from './VendorDetails'
import VendorDocuments from './documents/VendorDocuments'
import VendorRebateCredits from './rebate-credits/VendorRebateCredits'
import VendorPickupAddresses from './pickup-addresses/VendorPickupAddresses'
import VendorSalesmen from './salesman/VendorSalesmen'
import { hasPermission } from '@/utils/role-permission'

const Vendors: React.FC<VendorsProps> = ({ taxTypes, countriesWithStatesAndCities, paymentTerms }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [selectedUserAbleId, setSelectedUserAbleId] = useState<string | null>(null)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeTab, setActiveTab] = useState<string>('vendors')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateVendor, setCanCreateVendor] = useState<boolean>(false)
  const [canEditVendor, setCanEditVendor] = useState<boolean>(false)
  const [canDeleteVendor, setCanDeleteVendor] = useState<boolean>(false)
  const [canViewVendor, setCanViewVendor] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Vendor').then(result => setCanCreateVendor(result))
    hasPermission('Update Vendor').then(result => setCanEditVendor(result))
    hasPermission('Delete Vendor').then(result => setCanDeleteVendor(result))
    hasPermission('View Vendor').then(result => setCanViewVendor(result))
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
      VendorService.index(filterOptions)
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
    dispatch(setPageTitle('Manage Vendors'))
  }, [filterOptions])

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
      header: 'Vendor Name',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Full Address',
      cell: row => <span className='font-medium'>{row.address}</span>,
      sortable: true
    },
    {
      id: 'profit_margin',
      header: 'Profit Margin (%)',
      cell: row => <span className='font-medium'>{row.profit_margin}</span>,
      sortable: false
    },
    {
      id: 'is_enable_b2b',
      header: 'B2B Enabled',
      cell: row => <span className='font-medium'>{row.is_enable_b2b}</span>,
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
      {canCreateVendor && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Vendor
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
          },
          {
            label: 'Salesmen',
            icon: UserIcon,
            onClick: () => setActiveTab('salesman'),
            isActive: activeTab === 'salesman',
            disabled: !selectedVendorId && !selectedUserAbleId
          },
          {
            label: 'Documents',
            icon: DocumentIcon,
            onClick: () => setActiveTab('documents'),
            isActive: activeTab === 'documents',
            disabled: !selectedVendorId && !selectedUserAbleId
          },
          {
            label: 'Rebate & Credits',
            icon: DocumentIcon,
            onClick: () => setActiveTab('rebate-credits'),
            isActive: activeTab === 'rebate-credits',
            disabled: !selectedVendorId && !selectedUserAbleId
          },
          {
            label: 'Pickup Addresses',
            icon: DocumentIcon,
            onClick: () => setActiveTab('pickup-addresses'),
            isActive: activeTab === 'pickup-addresses',
            disabled: !selectedVendorId && !selectedUserAbleId
          }
        ]
      : [])
  ]

  const handleRowSelect = (partner: any) => {
    setSelectedVendorId(partner?.id || null)
    setSelectedUserAbleId(partner?.userable_id || null)
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
          <VendorDetails vendorId={selectedVendorId} onEdit={vendor => handleOpenEditModal(vendor.id)} />
        )}
        {activeTab === 'documents' && selectedVendorId && selectedUserAbleId && (
          <VendorDocuments vendorId={selectedUserAbleId || ''} />
        )}
        {activeTab === 'rebate-credits' && selectedVendorId && selectedUserAbleId && (
          <VendorRebateCredits vendorId={selectedUserAbleId || ''} />
        )}
        {activeTab === 'pickup-addresses' && selectedVendorId && selectedUserAbleId && (
          <VendorPickupAddresses
            countriesWithStatesAndCities={countriesWithStatesAndCities}
            vendorId={selectedUserAbleId || ''}
          />
        )}
        {activeTab === 'salesman' && selectedVendorId && selectedUserAbleId && (
          <VendorSalesmen vendorId={selectedUserAbleId || ''} />
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
