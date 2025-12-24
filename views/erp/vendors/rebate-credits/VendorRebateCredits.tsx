import { useEffect, useState } from 'react'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, DataTableApiResponse, Document, VendorRebateCredit } from '@/types'


import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import VendorRebateCreditService from '@/services/api/vendors/vendor-rebate-credits.service'
import { formatDate } from '@/utils/date'
import CreateOrEditRebateCreditModal from './CreateOrEditRebateCreditModal'

const VendorRebateCredits = ({ vendorId }: { vendorId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedRebateCreditId, setSelectedRebateCreditId] = useState<string | null>(null)
  const [selectedRebateCredit, setSelectedRebateCredit] = useState<VendorRebateCredit | null>(null)
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
      VendorRebateCreditService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Error fetching rebate credits')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Error fetching rebate credits')
    }
  }

  // Fetch data when filterOptions change
  useEffect(() => {
    fetchData()
  }, [filterOptions])

  // Transform API data to match table format
  const rebateCreditData = apiResponse?.data
    ? apiResponse.data.map((rebateCredit: VendorRebateCredit, index: number) => {
        return {
          id: rebateCredit.id,
          index: (apiResponse?.from || 1) + index,
          reference: rebateCredit.reference || '',
          work_order: '',
          amount: rebateCredit.amount || 0,
          balance: '',
          date: rebateCredit.date || '',
          note: rebateCredit.note || '',
          created_at: rebateCredit.created_at,
          updated_at: rebateCredit.updated_at
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedRebateCreditId(null)
    setSelectedRebateCredit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedRebateCreditId(id)

    // Fetch contact type details
    try {
      const response = await VendorRebateCreditService.show(id)

      setSelectedRebateCredit(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch rebate and credit details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedRebateCreditId(null)
    setSelectedRebateCredit(null)
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
      id: 'reference',
      header: 'Reference#',
      cell: row => <span className='font-medium'>{row.reference}</span>,
      sortable: true
    },
    {
      id: 'work_order',
      header: 'WO. #',
      cell: row => <span className='font-medium'>{row.work_order}</span>,
      sortable: false
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: row => <span className='font-medium'>{row.amount}</span>,
      sortable: true
    },
    {
      id: 'balance',
      header: 'Balance',
      cell: row => <span className='font-medium'>{row.balance}</span>,
      sortable: false
    },
    {
      id: 'date',
      header: 'Date',
      cell: row => <span className='font-medium'>{formatDate(row.date)}</span>,
      sortable: true
    },
    {
      id: 'note',
      header: 'Note',
      cell: row => <span className='font-medium'>{row.note}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <ThreeDotButton
          buttons={[
            <EditButton tooltip='Edit Rebate Credit' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
            <DeleteButton tooltip='Delete Rebate Credit' variant='text' onClick={() => handleDeleteRebateCredit(row.id)} />
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

  const handleDeleteRebateCredit = async (id: string) => {
    try {
      VendorRebateCreditService.destroy(id)
        .then(response => {
          toast.success('Rebate Credit deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete rebate credit')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the rebate credit!')
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Rebate and Credit
      </Button>
    </div>
  )

  return (
    <>
      <CommonTable
        data={{
          data: rebateCreditData,
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
        emptyMessage='No rebate and credit found'
      />

      <CreateOrEditRebateCreditModal
        vendorId={vendorId}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        rebateCreditId={selectedRebateCreditId || undefined}
        rebateCreditDetails={selectedRebateCredit || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default VendorRebateCredits
