'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, PaymentTerm, PaymentTermType } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters } from '@/utils/utility'
import CreateOrEditPaymentTermModal from './CreateOrEditPaymentTermModal'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import TableSearch from '@/components/erp/common/TableSearch'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'

type Permissions = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

const PaymentTerms: React.FC<{
  paymentTermTypes: PaymentTermType[] | []
  initialData?: DataTableApiResponse<PaymentTerm> | null
  permissions: Permissions
}> = ({
  paymentTermTypes,
  initialData,
  permissions: { canCreate: canCreatePaymentTerm, canEdit: canEditPaymentTerm, canDelete: canDeletePaymentTerm }
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<PaymentTerm> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<string | null>(null)
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const filterOptions = useMemo(() => {
    return getInitialFilters(searchParams)
  }, [searchParams])

  const setFilterOptions = (updater: any) => {
    const currentFilters = filterOptions
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

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
  }, [])

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    dispatch(setPageTitle('Payment Terms'))
  }, [dispatch])

  // Debounced search update
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
      header: 'Title',
      cell: row => <span>{row.name}</span>,
      sortable: true
    },
    {
      id: 'type',
      header: 'Payment Term Type',
      cell: row => <span>{row.type}</span>,
      sortable: true
    },
    {
      id: 'due_days',
      header: 'Due Days',
      cell: row => <span>{row.due_days}</span>,
      sortable: false
    },
    {
      id: 'day_of_month_due',
      header: 'Day of Month Due',
      cell: row => <span>{row.day_of_month_due}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditPaymentTerm || canDeletePaymentTerm) && (
            <ThreeDotButton
              buttons={[
                canEditPaymentTerm && (
                  <EditButton
                    tooltip='Edit Payment Term Information'
                    onClick={() => handleOpenEditModal(row.id)}
                    variant='text'
                  />
                ),
                canDeletePaymentTerm && (
                  <DeleteButton
                    tooltip='Delete Payment Term'
                    variant='text'
                    onClick={() => handleDeletePaymentTerm(row.id)}
                  />
                )
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

  const handleDeletePaymentTerm = async (id: string) => {
    try {
      await PaymentTermsService.destroy(id)
        .then(response => {
          toast.success('Payment Term deleted successfully')
          router.refresh()
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
      {canCreatePaymentTerm && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Payment Term</span>
        </Button>
      )}
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
