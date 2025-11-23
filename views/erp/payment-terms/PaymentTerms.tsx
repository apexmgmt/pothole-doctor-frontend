'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, PaymentTerm, PaymentTermType } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import CityService from '@/services/api/locations/city.service'
import CreateOrEditCityModal from '../locations/cities/CreateOrEditCityModal'
import { getInitialFilters, updateURL } from '@/utils/utility'
import PaymentTermsService from '@/services/api/payment_terms.service'
import CreateOrEditPaymentTermModal from './CreateOrEditPaymentTermModal'

const PaymentTerms: React.FC<{ paymentTermTypes: PaymentTermType[]|[] }> = ({ paymentTermTypes }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<string | null>(null)
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

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
      PaymentTermsService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching payment terms:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching payment terms:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Payment Terms'))
  }, [filterOptions])

  // Transform API data to match table format
  const paymentTermsData = apiResponse?.data
    ? apiResponse.data.map((paymentTerm: any, index: number) => {
        const typeObj = paymentTermTypes.find(t => t.type === paymentTerm.type)
        return {
          id: paymentTerm.id,
          index: (apiResponse?.from || 1) + index,
          name: paymentTerm.name,
          type: typeObj ? typeObj.name : paymentTerm.type,
          status: paymentTerm.status,
          due_days: paymentTerm.type === 'day' ? paymentTerm.due_time : 0,
          day_of_month_due: paymentTerm.type === 'month' ? paymentTerm.due_time : 0
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedPaymentTermId(null)
    setSelectedPaymentTerm(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedPaymentTermId(id)

    // Fetch payment term details
    try {
      const response = await PaymentTermsService.show(id)
      setSelectedPaymentTerm(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch payment term details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedPaymentTermId(null)
    setSelectedPaymentTerm(null)
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
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'type',
      header: 'Payment Term Type',
      cell: row => <span className='font-medium'>{row.type}</span>,
      sortable: true
    },
    {
      id: 'due_days',
      header: 'Due Days',
      cell: row => <span className='font-medium'>{row.due_days}</span>,
      sortable: false
    },
    {
      id: 'day_of_month_due',
      header: 'Day of Month Due',
      cell: row => <span className='font-medium'>{row.day_of_month_due}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Payment Term Information' onClick={() => handleOpenEditModal(row.id)} variant='icon' />
          <DeleteButton tooltip='Delete Payment Term' variant='icon' onClick={() => handleDeletePaymentTerm(row.id)} />
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

  const handleDeletePaymentTerm = async (id: string) => {
    try {
      PaymentTermsService.destroy(id)
        .then(response => {
          toast.success('Payment term deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete payment term')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the payment term!')
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
        Add Payment Term
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Payment Terms' noTabs={true}>
        <CommonTable
          data={{
            data: paymentTermsData,
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
          emptyMessage='No payment term found'
        />
      </CommonLayout>

      <CreateOrEditPaymentTermModal
        mode={modalMode}
        open={isModalOpen}
        paymentTermTypes={paymentTermTypes}
        onOpenChange={handleModalClose}
        paymentTermId={selectedPaymentTermId || undefined}
        paymentTermDetails={selectedPaymentTerm || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default PaymentTerms
