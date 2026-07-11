'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { ExcelIcon } from '@/public/icons'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { BusinessLocation, Column, DataTableApiResponse, MaterialJob, Staff, Warehouse } from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters } from '@/utils/utility'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import AddInventoryJobActionModal from '../inventory-jobs/AddInventoryJobActionModal'
import AddNonInventoryJobActionModal from '../non-inventory-jobs/AddNonInventoryJobActionModal'
import TableSearch from '@/components/erp/common/TableSearch'

interface MaterialJobsProps {
  staffs: Staff[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  initialData?: DataTableApiResponse<MaterialJob> | null
}

const MaterialJobs: React.FC<MaterialJobsProps> = ({ staffs, warehouses, businessLocations, initialData }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<MaterialJob> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')

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

  const [openInventoryModal, setOpenInventoryModal] = useState(false)
  const [openNonInventoryModal, setOpenNonInventoryModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<MaterialJob | null>(null)

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Material Jobs'))
  }, [])

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
        <>
          {row.job_type !== 'inventory' ? (
            <Badge variant={getOrderStatusVariant(row.order_status)} className='capitalize whitespace-nowrap'>
              {row.order_status?.replace(/_/g, ' ') || '—'}
            </Badge>
          ) : (
            <span></span>
          )}
        </>
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
      id: 'invoice_number',
      header: 'WO #',
      cell: (row: MaterialJob) => (
        <span>
          {row.work_order?.invoice_number_prefix ? `${row.work_order.invoice_number_prefix}-` : ''}
          {row.work_order?.invoice_number?.toString() || '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'job_name',
      header: 'Job Name',
      cell: (row: MaterialJob) => <span>{row.work_order?.title || '—'}</span>,
      sortable: false
    },
    {
      id: 'sale_representative',
      header: 'Sales Rep',
      cell: (row: MaterialJob) => {
        const name = [row.sale_representative?.first_name, row.sale_representative?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: MaterialJob) => <span>{row.company?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: MaterialJob) => {
        const name = [row.client?.first_name, row.client?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (row: MaterialJob) => {
        const name = [row.vendor?.first_name, row.vendor?.last_name].filter(Boolean).join(' ')

        return <span>{name || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row: MaterialJob) => <span>{row.product?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: (row: MaterialJob) => <span>{row.product?.sku || '—'}</span>,
      sortable: false
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: MaterialJob) => <span>{row.product?.vendor_style || '—'}</span>,
      sortable: false
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: MaterialJob) => <span>{row.product?.vendor_color || '—'}</span>,
      sortable: false
    },
    {
      id: 'quantity',
      header: 'Quantity',
      cell: (row: MaterialJob) => {
        const unit = row.actions?.[0]?.quantity_unit?.name

        return (
          <span>
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
        <span className='whitespace-nowrap'>{formatDate(row.scheduled_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'shipped_date',
      header: 'Ship Date',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.shipped_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'estimate_received_date',
      header: 'Est. Receive Date',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.estimate_received_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'actual_received_date',
      header: 'Act. Received Date',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.actual_received_date || '') || '—'}</span>
      ),
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
      id: 'actions',
      header: 'Action',
      cell: (row: MaterialJob) => (
        <div className='flex items-center justify-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            className='h-7 px-2 text-xs'
            onClick={() => {
              setSelectedJob(row)

              if (row.job_type === 'inventory') {
                setOpenInventoryModal(true)
              } else {
                setOpenNonInventoryModal(true)
              }
            }}
          >
            <Plus className='h-3 w-3 mr-1' />
            Add Action
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

  const handleExport = async () => {
    try {
      toast.info(`Exporting material jobs...`)
      const blob = await MaterialJobService.exportMaterialJobs(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `material-jobs-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Material jobs exported successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    }
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7 gap-1.5'
          onClick={handleExport}
        >
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>
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
    </div>
  )

  return (
    <>
      <CommonLayout title='Material Jobs' buttons={[]}>
        <CommonTable
          data={apiResponse ?? undefined}
          columns={columns}
          customFilters={customFilters}
          isLoading={isLoading}
          setFilterOptions={setFilterOptions}
        />
      </CommonLayout>
      <AddInventoryJobActionModal
        open={openInventoryModal}
        onOpenChange={setOpenInventoryModal}
        materialJob={selectedJob}
        staffs={staffs}
        warehouses={warehouses}
        businessLocations={businessLocations}
        onSuccess={() => router.refresh()}
      />
      <AddNonInventoryJobActionModal
        open={openNonInventoryModal}
        onOpenChange={setOpenNonInventoryModal}
        materialJob={selectedJob}
        staffs={staffs}
        warehouses={warehouses}
        businessLocations={businessLocations}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}

export default MaterialJobs
