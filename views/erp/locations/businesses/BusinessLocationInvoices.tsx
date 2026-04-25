'use client'

import React, { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Column, DataTableApiResponse, Invoice } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { formatDate } from '@/utils/date'
import InvoiceService from '@/services/api/invoices/invoices.service'
import { hasPermission } from '@/utils/role-permission'

const BusinessLocationInvoices: React.FC<{ locationId: string }> = ({ locationId }) => {
  const router = useRouter()
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [canDeleteInvoice, setCanDeleteInvoice] = useState<boolean>(false)
  const [canEditInvoice, setCanEditInvoice] = useState<boolean>(false)

  useEffect(() => {
    hasPermission('Update Invoice').then(result => setCanEditInvoice(result))
    hasPermission('Delete Invoice').then(result => setCanDeleteInvoice(result))
  }, [])

  // Debounced search update
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

    InvoiceService.index({ ...filterOptions, location_id: locationId })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        toast.error('Failed to fetch invoices')
      })
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions, locationId])

  const handleDeleteInvoice = async (id: string) => {
    try {
      await InvoiceService.destroy(id)
      toast.success('Invoice deleted successfully')
      fetchData()
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete invoice')
    }
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success'
      case 'overdue':
        return 'destructive'
      case 'sent':
      case 'sent to customer':
        return 'warning'
      case 'viewed':
      case 'viewed by customer':
        return 'info'
      case 'void':
        return 'destructive'
      case 'new':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const columns: Column[] = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      cell: (row: Invoice) => (
        <span
          className='font-medium hover:underline cursor-pointer'
          onClick={() => router.push(`/erp/invoices/${row.id}`)}
        >
          {row.invoice_number?.toString().padStart(6, '0') || 'N/A'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: Invoice) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Invoice) => <span className='font-medium'>{row?.client?.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Invoice) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'issue_date',
      header: 'Issue Date',
      cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.issue_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'due_date',
      header: 'Due Date',
      cell: (row: Invoice) => <span className='font-medium'>{formatDate(row.due_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: Invoice) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize'>
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row: Invoice) => (
        <span className='font-medium'>${row.total != null ? Number(row.total).toFixed(2) : '0.00'}</span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Invoice) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditInvoice || canDeleteInvoice) && (
            <ThreeDotButton
              buttons={[
                <Button
                  className='w-full'
                  onClick={() => window.open(`/invoice?inid=${row.inid}&icid=${row.icid}`, '_blank')}
                  variant='ghost'
                >
                  View/Print Invoice
                </Button>,
                canEditInvoice && (
                  <Button
                    key='edit'
                    className='w-full'
                    variant='ghost'
                    onClick={() => router.push(`/erp/invoices/${row.id}`)}
                  >
                    Edit Invoice
                  </Button>
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
    }
  ]

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const customFilters = (
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
      customFilters={<></>}
      setFilterOptions={setFilterOptions}
      showFilters={true}
      pagination={true}
      isLoading={isLoading}
      emptyMessage='No invoices found for this location'
    />
  )
}

export default BusinessLocationInvoices
