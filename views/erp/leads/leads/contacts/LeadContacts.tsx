import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, CountryWithStates, DataTableApiResponse, LeadContact } from '@/types'
import { formatDate } from '@/utils/date'
import { PlusIcon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import EditButton from '@/components/erp/common/buttons/EditButton'
import LeadContactService from '@/services/api/leads/lead-contacts.service'
import CreateOrEditContactModal from './CreateOrEditContactModal'

const LeadContacts = ({
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
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<LeadContact | null>(null)
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
      LeadContactService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching Contacts')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching Contacts')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedContactId(null)
    setSelectedContact(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedContactId(id)
    try {
      const response = await LeadContactService.show(id)
      setSelectedContact(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch contact details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedContactId(null)
    setSelectedContact(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteContact = async (id: string) => {
    try {
      LeadContactService.destroy(id)
        .then(response => {
          toast.success('Contact deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete Contact')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the Contact!')
    }
  }

  const columns: Column[] = [
    {
      id: 'name',
      header: 'Name',
      cell: row => <span className='font-medium'>{row?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'email',
      header: 'Email',
      cell: row => <span className='font-medium'>{row?.email || ''}</span>,
      sortable: false
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: row => <span className='font-medium'>{row.phone || ''}</span>,
      sortable: true
    },
    {
      id: 'address',
      header: 'Address',
      cell: row => {
        const parts = [row.address, row?.city?.name, row?.state?.name, row?.country?.name].filter(Boolean)
        return <span className='font-medium'>{parts.join(', ')}</span>
      },
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Created At',
      cell: row => <span className='font-medium'>{formatDate(row.created_at)}</span>,
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
              tooltip='Edit Contact'
              onClick={() => handleOpenEditModal(row.id)}
            />,
            <DeleteButton
              title='Delete'
              key='delete'
              tooltip='Delete Contact'
              variant='text'
              onClick={() => handleDeleteContact(row.id)}
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
        Add Contact
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: (apiResponse?.data as LeadContact[]) || [],
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
        emptyMessage='No Contact found'
      />

      <CreateOrEditContactModal
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        clientId={clientId}
        contact_id={selectedContactId}
        contact={selectedContact}
        countriesWithStatesAndCities={countriesWithStatesAndCities}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default LeadContacts
