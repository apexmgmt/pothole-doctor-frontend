'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import InvoiceService from '@/services/api/invoices/invoices.service'
import { Column, DataTableApiResponse, Invoice } from '@/types'
import { hasPermission } from '@/utils/role-permission'
import { getSharedInvoiceColumns } from './sharedInvoiceColumns'

type ReusableInvoiceTableProps = {
  fixedFilters?: Record<string, any>
  hiddenColumnIds?: string[]
  showCreateButton?: boolean
  onCreateInvoice?: () => void
  createButtonLabel?: string
  emptyMessage?: string
  refreshKey?: number
}

const ReusableInvoiceTable: React.FC<ReusableInvoiceTableProps> = ({
  fixedFilters = {},
  hiddenColumnIds = [],
  showCreateButton = false,
  onCreateInvoice,
  createButtonLabel = 'Add Invoice',
  emptyMessage = 'No invoices found',
  refreshKey = 0
}) => {
  const router = useRouter()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})

  const [canEditInvoice, setCanEditInvoice] = useState<boolean>(false)
  const [canDeleteInvoice, setCanDeleteInvoice] = useState<boolean>(false)

  useEffect(() => {
    hasPermission('Update Invoice').then(result => setCanEditInvoice(result))
    hasPermission('Delete Invoice').then(result => setCanDeleteInvoice(result))
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
      const response = await InvoiceService.index({ ...filterOptions, ...fixedFilters })

      setApiResponse(response.data)
    } catch {
      toast.error('Failed to fetch invoices')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, refreshKey, JSON.stringify(fixedFilters)])

  const handleDeleteInvoice = async (id: string) => {
    try {
      await InvoiceService.destroy(id)
      toast.success('Invoice deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete invoice')
    }
  }

  const actionColumn: Column = useMemo(
    () => ({
      id: 'actions',
      header: 'Action',
      cell: (row: Invoice) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditInvoice || canDeleteInvoice) && (
            <ThreeDotButton
              buttons={[
                <Button
                  key='view-print'
                  className='w-full'
                  onClick={() => window.open(`/invoice?inid=${row.inid}&icid=${row.icid}`, '_blank')}
                  variant='ghost'
                >
                  View/Print Invoice
                </Button>,
                canEditInvoice && (
                  <EditButton
                    key='edit'
                    tooltip='Edit Invoice'
                    onClick={() => router.push(`/erp/invoices/${row.id}`)}
                    variant='text'
                  />
                ),
                canDeleteInvoice && (
                  <DeleteButton
                    key='delete'
                    tooltip='Delete Invoice'
                    variant='text'
                    onClick={() => handleDeleteInvoice(row.id)}
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
    }),
    [canEditInvoice, canDeleteInvoice, router]
  )

  const allColumns: Column[] = useMemo(() => {
    const sharedColumns = getSharedInvoiceColumns(row => router.push(`/erp/invoices/${row.id}`))
    const [invoiceNumberColumn, ...remainingSharedColumns] = sharedColumns

    return [invoiceNumberColumn, actionColumn, ...remainingSharedColumns]
  }, [actionColumn, router])

  const columns = useMemo(
    () => allColumns.filter(column => !hiddenColumnIds.includes(column.id)),
    [allColumns, hiddenColumnIds]
  )

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1 sm:max-w-80!'>
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
      {showCreateButton && (
        <Button variant='default' size='sm' className='bg-light text-bg hover:bg-light/90' onClick={onCreateInvoice}>
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>{createButtonLabel}</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonTable
      data={{
        data: (apiResponse?.data as Invoice[]) || [],
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
      emptyMessage={emptyMessage}
    />
  )
}

export default ReusableInvoiceTable
