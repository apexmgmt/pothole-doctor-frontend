'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Plus, Trash2 } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import {
  BusinessLocation,
  Column,
  DataTableApiResponse,
  MaterialJob,
  MaterialJobAction,
  Staff,
  Warehouse
} from '@/types'
import { formatDate } from '@/utils/date'
import { getInitialFilters, updateURL } from '@/utils/utility'
import MaterialJobService from '@/services/api/products/material-jobs.service'
import AddNonInventoryJobActionModal from './AddNonInventoryJobActionModal'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

interface NonInventoryJobsProps {
  staffs: Staff[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
}

const NonInventoryJobs: React.FC<NonInventoryJobsProps> = ({ staffs, warehouses, businessLocations }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')

  const [filterOptions, setFilterOptions] = useState<any>(() => ({
    ...getInitialFilters(searchParams)
  }))

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [openActionModal, setOpenActionModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<MaterialJob | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deletingAction, setDeletingAction] = useState<{ jobId: string; actionId: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Non-Inventory Jobs'))
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

  const toggleRow = (row: MaterialJob) => {
    setExpandedRows(prev => {
      const next = new Set(prev)

      if (next.has(row.id)) {
        next.delete(row.id)
      } else {
        next.add(row.id)
      }

      return next
    })
  }

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

  const getWarehouseName = (action: MaterialJobAction): string => {
    if (!action.warehouse) return '—'
    const w = action.warehouse as any

    return w.title || w.name || '—'
  }

  const columns: Column[] = [
    {
      id: 'order_status',
      header: 'Order Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getStatusVariant(row.order_status)} className='capitalize whitespace-nowrap'>
          {row.order_status?.replace(/_/g, ' ') || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'status',
      header: 'Action Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize whitespace-nowrap'>
          {row.status?.replace(/_/g, ' ') || '—'}
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
      id: 'job_type',
      header: 'Job Type',
      cell: (row: MaterialJob) => <span>{row.service_type?.name || '—'}</span>,
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
      cell: (row: MaterialJob) => <span>{row.quantity ?? '—'}</span>,
      sortable: true
    },
    {
      id: 'received_quantity',
      header: 'Received Qty',
      cell: (row: MaterialJob) => <span>{row.received_quantity ?? '—'}</span>,
      sortable: true
    },
    {
      id: 'picked_up_quantity',
      header: 'Picked-up Qty',
      cell: (row: MaterialJob) => <span>{row.picked_up_quantity ?? '—'}</span>,
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
      id: 'available_date',
      header: 'Avail. Date',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.available_date || '') || '—'}</span>
      ),
      sortable: true
    },
    {
      id: 'scheduled_date',
      header: 'Schedule Date',
      cell: (row: MaterialJob) => (
        <span className='whitespace-nowrap'>{formatDate(row.scheduled_date || '') || '—'}</span>
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
              setOpenActionModal(true)
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

  const renderExpandedRow = (row: MaterialJob) => {
    if (!row.actions || row.actions.length === 0) return null

    return (
      <table className='min-w-full text-xs'>
        <thead>
          <tr className='text-zinc-400 text-left border-b border-zinc-700'>
            <th className='px-3 py-1.5 whitespace-nowrap'>Action</th>
            <th className='px-3 py-1.5 whitespace-nowrap'>Employee</th>
            <th className='px-3 py-1.5 whitespace-nowrap'>Quantity</th>
            <th className='px-3 py-1.5 whitespace-nowrap'>Warehouse</th>
            <th className='px-3 py-1.5 whitespace-nowrap'>Action Date</th>
            <th className='px-3 py-1.5 whitespace-nowrap'>Comments</th>
            <th className='px-3 py-1.5 text-center whitespace-nowrap'>Action</th>
          </tr>
        </thead>
        <tbody>
          {row.actions.map((action: MaterialJobAction, idx: number) => (
            <tr key={action.id} className='border-b border-zinc-800/60 hover:bg-zinc-900/60'>
              <td className='px-3 py-1.5'>
                <Badge
                  variant={getStatusVariant(action.action_status)}
                  className='capitalize whitespace-nowrap text-xs'
                >
                  {action.action_status?.replace(/_/g, ' ') || '—'}
                </Badge>
              </td>
              <td className='px-3 py-1.5 whitespace-nowrap'>
                {[action.employee?.first_name, action.employee?.last_name].filter(Boolean).join(' ') || '—'}
              </td>
              <td className='px-3 py-1.5 whitespace-nowrap'>
                {action.quantity ?? '—'}
                {action.quantity_unit?.name && <span className='text-zinc-500 ml-1'>{action.quantity_unit.name}</span>}
              </td>
              <td className='px-3 py-1.5'>{getWarehouseName(action)}</td>
              <td className='px-3 py-1.5 whitespace-nowrap'>{formatDate(action.action_date || '') || '—'}</td>
              <td className='px-3 py-1.5'>{action.location_notes || '—'}</td>
              <td className='px-3 py-1.5 text-center'>
                <div className='flex items-center justify-center gap-2'>
                  {idx === 0 && (
                    <Button
                      size='icon'
                      variant='ghost'
                      className='h-6 w-6 text-destructive hover:text-destructive'
                      onClick={() => {
                        setDeletingAction({ jobId: row.id, actionId: action.id })
                        setConfirmDeleteOpen(true)
                      }}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

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
    <>
      <CommonLayout title='Non-Inventory Jobs' buttons={[]}>
        <CommonTable
          data={apiResponse ?? undefined}
          columns={columns}
          customFilters={customFilters}
          isLoading={isLoading}
          setFilterOptions={setFilterOptions}
          expandableRow={{
            render: renderExpandedRow,
            isExpanded: (row: MaterialJob) => expandedRows.has(row.id),
            onToggle: toggleRow,
            canExpand: (row: MaterialJob) => !!row.actions?.length
          }}
        />
      </CommonLayout>
      <AddNonInventoryJobActionModal
        open={openActionModal}
        onOpenChange={setOpenActionModal}
        materialJob={selectedJob}
        staffs={staffs}
        warehouses={warehouses}
        businessLocations={businessLocations}
        onSuccess={fetchData}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title='Delete Action'
        message='Are you sure you want to delete this action? This cannot be undone.'
        confirmButtonTitle='Delete'
        confirmButtonProps={{ className: 'bg-destructive hover:bg-destructive/90 text-white' }}
        loading={isDeleting}
        onConfirm={async () => {
          if (!deletingAction) return

          setIsDeleting(true)

          try {
            await MaterialJobService.destroyAction(deletingAction.jobId, deletingAction.actionId)
            toast.success('Action deleted')
            setConfirmDeleteOpen(false)
            setDeletingAction(null)
            fetchData()
          } catch {
            toast.error('Failed to delete action')
          } finally {
            setIsDeleting(false)
          }
        }}
      />
    </>
  )
}

export default NonInventoryJobs
