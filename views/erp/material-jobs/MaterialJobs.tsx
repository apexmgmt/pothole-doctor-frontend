'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { Column, DataTableApiResponse, MaterialJob } from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters, updateURL } from '@/utils/utility'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import { useRouter } from 'next/navigation'

const MaterialJobs: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(() => getInitialFilters(searchParams))

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Material Jobs'))
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

        const prevKeys = Object.keys(prev)
        const newKeys = Object.keys(newOptions)

        if (prevKeys.length === newKeys.length && newKeys.every(k => prev[k] === newOptions[k])) {
          return prev
        }

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      MaterialJobService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    } catch {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
  }, [filterOptions])

  const getOrderStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'received':
      case 'partially_received':
        return 'info'
      case 'shipped':
      case 'shipped_from_vendor':
        return 'warning'
      case 'prepared':
      case 'partially_prepared':
        return 'pending'
      case 'allocated':
        return 'secondary'
      case 'new':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getActionStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'in_progress':
      case 'in progress':
        return 'info'
      case 'pending':
        return 'pending'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const columns: Column[] = [
    {
      id: 'order_status',
      header: 'Order Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getOrderStatusVariant(row.order_status)} className='capitalize whitespace-nowrap'>
          {row.order_status?.replace(/_/g, ' ') || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'action_status',
      header: 'Action Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getActionStatusVariant(row.status)} className='capitalize whitespace-nowrap'>
          {row.status?.replace(/_/g, ' ') || '—'}
        </Badge>
      ),
      sortable: false
    },
    {
      id: 'job_type',
      header: 'Type',
      cell: (row: MaterialJob) => (
        <Badge variant='secondary' className='capitalize whitespace-nowrap'>
          {row.job_type?.replace(/_/g, ' ') || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'work_order_number',
      header: 'WO #',
      cell: (row: MaterialJob) => (
        <span className='font-medium'>{row.work_order?.work_order_number?.toString().padStart(6, '0') || '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'job_name',
      header: 'Job Name',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.work_order?.title || '—'}</span>,
      sortable: false
    },
    {
      id: 'sale_representative',
      header: 'Sales Rep',
      cell: (row: MaterialJob) => {
        const name = [row.sale_representative?.first_name, row.sale_representative?.last_name].filter(Boolean).join(' ')

        return <span className='font-medium'>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: MaterialJob) => {
        const name = [row.client?.first_name, row.client?.last_name].filter(Boolean).join(' ')

        return <span className='font-medium'>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (row: MaterialJob) => {
        const name = [row.vendor?.first_name, row.vendor?.last_name].filter(Boolean).join(' ')

        return <span className='font-medium'>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.product?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.product?.sku || '—'}</span>,
      sortable: false
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.product?.vendor_style || '—'}</span>,
      sortable: false
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: MaterialJob) => <span className='font-medium'>{row.product?.vendor_color || '—'}</span>,
      sortable: false
    },
    {
      id: 'quantity',
      header: 'Quantity',
      cell: (row: MaterialJob) => {
        const unit = row.actions?.[0]?.quantity_unit?.name

        return (
          <span className='font-medium'>
            {row.quantity ?? '—'}
            {unit && <span className='text-zinc-400 ml-1 text-xs'>{unit}</span>}
          </span>
        )
      },
      sortable: true
    },
    {
      id: 'scheduled_date',
      header: 'Scheduled Date',
      cell: (row: MaterialJob) => (
        <span className='font-medium whitespace-nowrap'>{formatDate(row.scheduled_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'shipped_date',
      header: 'Ship Date',
      cell: (row: MaterialJob) => (
        <span className='font-medium whitespace-nowrap'>{formatDate(row.shipped_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'estimate_received_date',
      header: 'Est. Receive Date',
      cell: (row: MaterialJob) => (
        <span className='font-medium whitespace-nowrap'>{formatDate(row.estimate_received_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'actual_received_date',
      header: 'Act. Received Date',
      cell: (row: MaterialJob) => (
        <span className='font-medium whitespace-nowrap'>{formatDate(row.actual_received_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'total_material_cost',
      header: 'Total Material',
      cell: (row: MaterialJob) => (
        <span className='font-medium'>
          ${row.total_material_cost != null ? Number(row.total_material_cost).toFixed(2) : '0.00'}
        </span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (_row: MaterialJob) => <div className='flex items-center justify-center gap-2' />,
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
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
    </div>
  )

  return (
    <CommonLayout title='Material Jobs' buttons={[]}>
      <CommonTable
        data={apiResponse ?? undefined}
        columns={columns}
        customFilters={customFilters}
        isLoading={isLoading}
        setFilterOptions={setFilterOptions}
      />
    </CommonLayout>
  )
}

export default MaterialJobs
