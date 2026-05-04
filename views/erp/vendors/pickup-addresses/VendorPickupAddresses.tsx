import { useEffect, useState } from 'react'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, CountryWithStates, DataTableApiResponse, VendorPickupAddress, VendorRebateCredit } from '@/types'

import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import VendorRebateCreditService from '@/services/api/vendors/vendor-rebate-credits.service'
import { formatDate } from '@/utils/date'
import VendorPickupAddressService from '@/services/api/vendors/vendor-pickup-addresses.service'
import CreateOrEditPickupAddressModal from './CreateOrEditPickupAddressModal'

const VendorPickupAddresses = ({
  vendorId,
  countriesWithStatesAndCities
}: {
  vendorId: string
  countriesWithStatesAndCities: CountryWithStates[]
}) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState<string | null>(null)
  const [selectedPickupAddress, setSelectedPickupAddress] = useState<VendorPickupAddress | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: vendorId })

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
      VendorPickupAddressService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching pickup addresses')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching pickup addresses')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

  // Transform API data to match table format
  const pickupAddressData = apiResponse?.data
    ? apiResponse.data.map((pickupAddress: VendorPickupAddress, index: number) => {
        return {
          id: pickupAddress.id,
          index: (apiResponse?.from || 1) + index,
          title: pickupAddress.title,
          street_address: pickupAddress.street_address,
          email: pickupAddress.email || '',
          phone: pickupAddress.phone || '',
          city: pickupAddress.city ? pickupAddress.city.name : '',
          state: pickupAddress.state ? pickupAddress.state.name : '',
          address: `${pickupAddress.street_address}, ${pickupAddress.city ? pickupAddress.city.name : ''}, ${pickupAddress.state ? pickupAddress.state.name : ''}, ${pickupAddress.zip_code}`,
          zip_code: pickupAddress.zip_code,
          is_default: pickupAddress.is_default,
          created_at: pickupAddress.created_at,
          updated_at: pickupAddress.updated_at
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedPickupAddressId(null)
    setSelectedPickupAddress(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedPickupAddressId(id)

    // Fetch contact type details
    try {
      const response = await VendorPickupAddressService.show(id)

      setSelectedPickupAddress(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch pickup address details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPickupAddressId(null)
    setSelectedPickupAddress(null)
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
      id: 'title',
      header: 'Title',
      cell: row => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: row => <span className='font-medium'>{row.address}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton tooltip='Edit Pickup Address' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
            <DeleteButton
              tooltip='Delete Pickup Address'
              variant='text'
              onClick={() => handleDeletePickupAddress(row.id)}
            />
          ]}
        />
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({ searchable_id: vendorId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const handleDeletePickupAddress = async (id: string) => {
    try {
      await VendorPickupAddressService.destroy(id)
        .then(response => {
          toast.success('Pickup Address deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete pickup address')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the pickup address!')
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
        <InputGroup>
          <InputGroupInput
            placeholder='Search...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className='lg:w-80 min-w-0'
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
        <span className='hidden min-[480px]:block'>Add Pickup Address</span>
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: pickupAddressData,
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
        emptyMessage='No pickup addresses found'
      />

      <CreateOrEditPickupAddressModal
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        vendorId={vendorId}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        pickupAddressId={selectedPickupAddressId || undefined}
        pickupAddressDetails={selectedPickupAddress || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default VendorPickupAddresses
