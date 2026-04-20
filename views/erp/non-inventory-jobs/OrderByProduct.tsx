'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ShoppingCart } from 'lucide-react'

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
import UpdateMaterialJobModal from './UpdateMaterialJobModal'

const OrderByProduct: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<MaterialJob | null>(null)

  const [filterOptions, setFilterOptions] = useState<any>(() => ({
    ...getInitialFilters(searchParams)
  }))

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Order By Product'))
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
      MaterialJobService.index({ ...filterOptions, job_type: 'non_inventory' })
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

  const getStatusVariant = (
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
      case 'in_progress':
      case 'in progress':
        return 'info'
      case 'pending':
        return 'pending'
      case 'cancelled':
        return 'destructive'
      case 'new':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const columns: Column[] = [
    {
      id: 'order_status',
      header: 'Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getStatusVariant(row.order_status)} className='capitalize whitespace-nowrap'>
          {row.order_status?.replace(/_/g, ' ') || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row: MaterialJob) => <span>{row.service_item?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'service_type',
      header: 'Service Type',
      cell: (row: MaterialJob) => <span>{row.service_type?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'vendor',
      header: 'Manufacturer',
      cell: (row: MaterialJob) => {
        const name = [row.vendor?.first_name, row.vendor?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
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
      id: 'company',
      header: 'Company Name',
      cell: (row: MaterialJob) => <span>{row.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer Name',
      cell: (row: MaterialJob) => {
        const name = [row.client?.first_name, row.client?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'order_number',
      header: 'Order Number',
      cell: (row: MaterialJob) => <span>{row.order_number || '—'}</span>,
      sortable: true
    },
    {
      id: 'total_material_cost',
      header: 'Total Material',
      cell: (row: MaterialJob) => (
        <span>${row.total_material_cost != null ? Number(row.total_material_cost).toFixed(2) : '0.00'}</span>
      ),
      sortable: true
    },
    {
      id: 'sale_representative',
      header: 'Added By',
      cell: (row: MaterialJob) => {
        const name = [row.sale_representative?.first_name, row.sale_representative?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'created_at',
      header: 'Date Added',
      cell: (row: MaterialJob) => <span className='whitespace-nowrap'>{formatDate(row.created_at || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'available_date',
      header: 'Date Available',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.available_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: MaterialJob) => (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            title='Update Order'
            onClick={() => {
              setSelectedJob(row)
              setUpdateModalOpen(true)
            }}
          >
            <ShoppingCart className='h-4 w-4' />
          </Button>
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
    <CommonLayout title='Order By Product' buttons={[]}>
      <CommonTable
        data={apiResponse ?? undefined}
        columns={columns}
        customFilters={customFilters}
        isLoading={isLoading}
        setFilterOptions={setFilterOptions}
      />

      <UpdateMaterialJobModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        materialJob={selectedJob}
        onSuccess={fetchData}
      />
    </CommonLayout>
  )
}

export default OrderByProduct
