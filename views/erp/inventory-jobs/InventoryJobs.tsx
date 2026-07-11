'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import AddInventoryJobActionModal from './AddInventoryJobActionModal'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { formatCurrency } from '@/utils/currency'
import TableSearch from '@/components/erp/common/TableSearch'
import { ExcelIcon } from '@/public/icons'

interface InventoryJobsProps {
  staffs: Staff[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  initialData?: DataTableApiResponse<any> | null
  permissions?: {
    canCreateJob: boolean
    canViewJob: boolean
    canEditJob: boolean
    canDeleteJob: boolean
  }
}

const InventoryJobs: React.FC<InventoryJobsProps> = ({ staffs, warehouses, businessLocations, initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<any> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')

  const filterOptions = useMemo(() => ({
    ...getInitialFilters(searchParams)
  }), [searchParams])

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [openActionModal, setOpenActionModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState<MaterialJob | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deletingAction, setDeletingAction] = useState<{ jobId: string; actionId: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const canCreateJob = permissions?.canCreateJob ?? false
  const canEditJob = permissions?.canEditJob ?? false
  const canDeleteJob = permissions?.canDeleteJob ?? false
  const canViewJob = permissions?.canViewJob ?? false

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Inventory Jobs'))
  }, [dispatch])

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
      id: 'status',
      header: 'Status',
      cell: (row: MaterialJob) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize whitespace-nowrap'>
          {row.status?.replace(/_/g, ' ') || '—'}
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
      id: 'allocated_quantity',
      header: 'Allocated Qty',
      cell: (row: MaterialJob) => (
        <span>
          {row.allocated_quantity ?? '—'} {row?.product?.purchase_uom?.name ?? row?.product?.purchase_unit?.name ?? ''}
        </span>
      ),
      sortable: true
    },
    {
      id: 'picked_up_quantity',
      header: 'Picked-up Qty',
      cell: (row: MaterialJob) => (
        <span>
          {row.picked_up_quantity ?? '—'} {row?.product?.purchase_uom?.name ?? row?.product?.purchase_unit?.name ?? ''}
        </span>
      ),
      sortable: true
    },
    {
      id: 'on_hand_quantity',
      header: 'On-Hand Qty',
      cell: (row: MaterialJob) => (
        <span>
          {row.on_hand_quantity ?? '—'} {row?.product?.purchase_uom?.name ?? row?.product?.purchase_unit?.name ?? ''}
        </span>
      ),
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Created Date',
      cell: (row: MaterialJob) => <span className='whitespace-nowrap'>{formatDate(row.created_at || '') || '—'}</span>,
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
      id: 'total_material_cost',
      header: 'Total Material',
      cell: (row: MaterialJob) => <span>{formatCurrency(row.total_material_cost ?? 0)}</span>,
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
          <tr className='text-accent-foreground text-left border-b border-accent'>
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
            <tr key={action.id} className='border-b border-accent/30 hover:bg-accent/30'>
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
    setFilterOptions({ job_type: 'inventory' })
    setSearchValue('')
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting inventory jobs...`)
      const blob = await MaterialJobService.exportMaterialJobs({ ...filterOptions, job_type: 'inventory' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `inventory-jobs-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Inventory jobs exported successfully')
    } catch (error) {
      toast.error('Failed to export inventory jobs')
      console.error('Export error:', error)
    }
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(
      key => key !== 'page' && key !== 'per_page' && key !== 'job_type'
    )

    return filterKeys.length > 0
  }

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex flex-row gap-2'>
        <Button
          variant='default'
          size='sm'
          className='h-7 bg-light text-bg hover:bg-light/90'
          onClick={handleExport}
        >
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>
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
      </div>
    </div>
  )

  return (
    <>
      <CommonLayout title='Inventory Jobs' buttons={[]}>
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
      <AddInventoryJobActionModal
        open={openActionModal}
        onOpenChange={setOpenActionModal}
        materialJob={selectedJob}
        staffs={staffs}
        warehouses={warehouses}
        businessLocations={businessLocations}
        onSuccess={() => router.refresh()}
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
            router.refresh()
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

export default InventoryJobs
