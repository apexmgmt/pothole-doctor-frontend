import { useEffect, useState } from 'react'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, CountryWithStates, DataTableApiResponse, ClientAddress } from '@/types'


import EditButton from '@/components/erp/common/buttons/EditButton'
import CreateOrEditAddressModal from './CreateOrEditAddressModal'
import ClientAddressService from '@/services/api/clients/client-addresses.service'

const ClientAddresses = ({
  clientId,
  countriesWithStatesAndCities
}: {
  clientId: string
  countriesWithStatesAndCities: CountryWithStates[]
}) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<ClientAddress | null>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: clientId })

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

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

    try {
      ClientAddressService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching addresses')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching addresses')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedAddressId(null)
    setSelectedAddress(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedAddressId(id)

    try {
      const response = await ClientAddressService.show(id)

      setSelectedAddress(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch address details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedAddressId(null)
    setSelectedAddress(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      ClientAddressService.destroy(id)
        .then(response => {
          toast.success('Address deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete Address')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the Address!')
    }
  }

  const columns: Column[] = [
    {
      id: 'contact_name',
      header: 'Contact Name',
      cell: row => <span className='font-medium'>{''}</span>,
      sortable: false
    },
    {
      id: 'title',
      header: 'Address Title',
      cell: row => <span className='font-medium'>{row?.title || ''}</span>,
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row.email || ''}</span>,
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone || ''}</span>,
      sortable: true
    },
    {
      id: 'street_address',
      header: 'Address',
      cell: row => {
        const parts = [row.street_address, row?.city?.name, row?.state?.name].filter(Boolean)

        
return <span className='font-medium'>{parts.join(', ')}</span>
      },
      sortable: true
    },
    {
      id: 'is_default',
      header: 'Default',
      cell: row => <span className='font-medium'>{row.is_default ? 'Yes' : 'No'}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton
              title='Edit'
              key='edit'
              variant='text'
              tooltip='Edit Address'
              onClick={() => handleOpenEditModal(row.id)}
            />,
            <DeleteButton
              title='Delete'
              key='delete'
              tooltip='Delete Address'
              variant='text'
              onClick={() => handleDeleteAddress(row.id)}
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
    setFilterOptions({ searchable_id: clientId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    
return filterKeys.length > 0
  }

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
        Add Address
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as ClientAddress[]) || [],
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
        emptyMessage='No address found'
      />

      <CreateOrEditAddressModal
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        clientId={clientId}
        address_id={selectedAddressId}
        address={selectedAddress}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ClientAddresses
