import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import LeadSmsService from '@/services/api/leads/lead-sms.service'
import { Client, ClientSms, Column, DataTableApiResponse, Lead, LeadSms } from '@/types'
import { PlusIcon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CreateOrEditSmsModal from './CreateOrEditSmsModal'
import ClientSmsService from '@/services/api/clients/client-sms.service'

const ClientSmsView = ({ clientId, client }: { clientId: string; client: Client | null }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: clientId })

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
      ClientSmsService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching SMS')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching SMS')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

  // Transform API data to match table format
  const smsData = apiResponse?.data
    ? apiResponse.data.map((sms: ClientSms, index: number) => {
        return {
          id: sms.id,
          index: (apiResponse?.from || 1) + index,
          client_id: sms.client_id,
          to: sms.to,
          message: sms.message,
          received_from: sms.received_from,
          type: sms.type,
          status: sms.status,
          sent_date: sms.sent_date,
          created_at: sms.created_at,
          updated_at: sms.updated_at
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleDeleteSms = async (id: string) => {
    try {
      ClientSmsService.destroy(id)
        .then(response => {
          toast.success('SMS deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete SMS')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the SMS!')
    }
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
      id: 'status',
      header: 'Status',
      cell: row => (
        <span className={row.status === 1 ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {row.status === 1 ? 'Sent' : 'Failed'}
        </span>
      ),
      sortable: true
    },
    {
      id: 'to',
      header: 'To',
      cell: row => <span className='font-medium'>{row.to}</span>,
      sortable: true
    },
    {
      id: 'message',
      header: 'Message',
      cell: row => <span className='truncate max-w-xs block'>{row.message}</span>,
      sortable: false
    },
    {
      id: 'received_from',
      header: 'Sent/Received From',
      cell: row => <span>{row.received_from || '-'}</span>,
      sortable: false
    },
    {
      id: 'type',
      header: 'Type',
      cell: row => <span>{row.type || '-'}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <DeleteButton
              tooltip='Delete SMS'
              variant='text'
              onClick={() => handleDeleteSms(row.id)}
              disabled={row.status !== 0}
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Send SMS
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: smsData,
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
        emptyMessage='No SMS found'
      />

      <CreateOrEditSmsModal
        clientId={clientId}
        client={client}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ClientSmsView
