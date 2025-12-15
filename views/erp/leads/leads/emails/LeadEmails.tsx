import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, DataTableApiResponse, Lead, LeadEmail } from '@/types'
import { PlusIcon, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import LeadEmailService from '@/services/api/leads/lead-emails.service'
import { formatDate } from '@/utils/date'
import CreateOrEditEmailModal from './CreateOrEditEmailModal'

const LeadEmails = ({ clientId, lead }: { clientId: string; lead: Lead | null }) => {
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
      LeadEmailService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching emails')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching emails')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

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

  const handleDeleteEmail = async (id: string) => {
    try {
      LeadEmailService.destroy(id)
        .then(response => {
          toast.success('Email deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete email')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the email!')
    }
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'user',
      header: 'Sent By',
      cell: row => {
        const parts = [row?.user?.first_name, row?.user?.last_name].filter(Boolean)
        return <span className='font-medium'>{parts.join(', ')}</span>
      },
      sortable: true
    },
    {
      id: 'source',
      header: 'Source',
      cell: row => <span className='font-medium'>{row.source}</span>,
      sortable: false
    },
    {
      id: 'subject',
      header: 'Subject',
      cell: row => <span className='font-medium'>{row.subject || ''}</span>,
      sortable: false
    },
    {
      id: 'created_at',
      header: 'Date Sent',
      cell: row => <span className='font-medium'>{formatDate(row.created_at)}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <DeleteButton
              tooltip='Delete Email'
              variant='text'
              onClick={() => handleDeleteEmail(row.id)}
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
        Send Email
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: apiResponse?.data as LeadEmail[] || [],
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
        emptyMessage='No email found'
      />

      <CreateOrEditEmailModal
        clientId={clientId}
        lead={lead}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default LeadEmails
