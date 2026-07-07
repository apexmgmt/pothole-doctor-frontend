'use client'

import React, { useEffect, useState, useMemo } from 'react'
import debounce from '@/utils/debounce'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { getInitialFilters, updateURL } from '@/utils/utility'
import { hasPermission } from '@/utils/role-permission'
import { Description } from '@/components/ui/description'
import ScheduleService from '@/services/api/schedules.service'
import { formatDate } from '@/utils/date'
import { Schedule } from '@/types/schedules'
import { Column, Partner, WorkOrder } from '@/types'
import TableSearch from '@/components/erp/common/TableSearch'
import ScheduleFormDialog from './ScheduleFormDialog'
import { ExcelIcon } from '@/public/icons'

const Schedules: React.FC<{
  workOrders?: WorkOrder[]
  partners?: Partner[]
  initialData?: any
  permissions?: {
    canCreate: boolean
    canView: boolean
    canEdit: boolean
    canDelete: boolean
  }
}> = ({
  workOrders = [],
  partners = [],
  initialData,
  permissions
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<any>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const filterOptions = useMemo(() => getInitialFilters(searchParams), [searchParams])
  const canCreate = permissions?.canCreate ?? false
  const canEdit = permissions?.canEdit ?? false
  const canDelete = permissions?.canDelete ?? false

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Schedules'))
  }, [])

  const setFilterOptions = (updater: any) => {
    const currentFilters = getInitialFilters(searchParams)
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

          if (newOptions.page) delete newOptions.page

          return newOptions
        })
      }, 500),
    []
  )

  const onSearchChange = (value: string) => {
    setSearchValue(value)
    debouncedSearch(value)
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await ScheduleService.destroy(id)
        .then(() => {
          toast.success('Schedule deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(error.message || 'Failed to delete schedule')
        })
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule')
    }
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting schedules...`)
      const blob = await ScheduleService.exportSchedules(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `schedules-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`Schedules exported successfully`)
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    }
  }

  // Columns definition
  const columns: Column[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row: Schedule) => {
        const statusMap: any = {
          scheduled: { label: 'Scheduled', variant: 'info' },
          completed: { label: 'Completed', variant: 'success' },
          cancelled: { label: 'Cancelled', variant: 'outline' },
          pending: { label: 'Pending', variant: 'secondary' },
          overdue: { label: 'Overdue', variant: 'destructive' }
        }

        const normalized = (row.status || '').toString().trim().toLowerCase().replace(/\s+/g, '-')
        const statusObj = statusMap[normalized] || { label: row.status, variant: 'default' }

        return (
          <Badge key={row.id} variant={statusObj.variant} className='mr-1 mb-1'>
            {statusObj.label}
          </Badge>
        )
      },
      sortable: true
    },
    {
      id: 'title',
      header: 'Job Name',
      cell: (row: Schedule) => <span>{row.title || ''}</span>,
      sortable: true
    },
    {
      id: 'invoice_number',
      header: 'WO#',
      cell: (row: Schedule) => (
        <span>
          {row.work_order?.invoice_number_prefix ? `${row.work_order.invoice_number_prefix}-` : ''}
          {row.work_order?.invoice_number?.toString() || '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Schedule) => <span>{row.client?.company?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'job_type',
      header: 'Job Type',
      cell: (row: Schedule) => <span>{row.service_type?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'contractor',
      header: 'Contractor',
      cell: (row: Schedule) => {
        const parts = [row.contractor?.first_name, row.contractor?.last_name].filter(Boolean)

        return <span>{parts.join(' ') || ''}</span>
      },
      sortable: false
    },
    {
      id: 'starting_date',
      header: 'Start Date',
      cell: (row: Schedule) => <span>{formatDate(row.starting_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'ending_date',
      header: 'End Date',
      cell: (row: Schedule) => <span>{formatDate(row.ending_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'starting_time',
      header: 'Start Time',
      cell: (row: Schedule) => <span>{row.starting_time || ''}</span>,
      sortable: true
    },
    {
      id: 'ending_time',
      header: 'End Time',
      cell: (row: Schedule) => <span>{row.ending_time || ''}</span>,
      sortable: true
    },
    {
      id: 'job_days',
      header: 'Job Days',
      cell: (row: Schedule) => {
        if (row.starting_date && row.ending_date) {
          const start = new Date(row.starting_date)
          const end = new Date(row.ending_date)
          const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

          return <span>{diff}</span>
        }

        return <span>-</span>
      },
      sortable: false
    },
    {
      id: 'contractor_notes',
      header: 'Contractor Notes',
      cell: (row: any) => <Description description={row.service_group?.contractor_notes ?? ''} />,
      sortable: false
    },
    {
      id: 'special_instructions',
      header: 'Special Instruction',
      cell: (row: Schedule) => <Description description={row?.special_instructions ?? ''} />,
      sortable: true
    },
    {
      id: 'internal_commands',
      header: 'Internal Notes',
      cell: (row: Schedule) => <Description description={row?.internal_commands ?? ''} />,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Schedule) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEdit || canDelete) && (
            <ThreeDotButton
              buttons={[
                ...(canEdit
                  ? [
                      <EditButton
                        tooltip='Edit Schedule'
                        onClick={() => {
                          setModalMode('edit')
                          setSelectedSchedule(row)
                          setIsModalOpen(true)
                        }}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDelete
                  ? [
                      <DeleteButton
                        tooltip='Delete Schedule'
                        variant='text'
                        onClick={() => handleDeleteSchedule(row.id)}
                      />
                    ]
                  : [])
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

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex flex-row gap-2'>
        <Button variant='default' size='sm' className='h-7 bg-light text-bg hover:bg-light/90' onClick={handleExport}>
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
    <CommonLayout title='Schedules' noTabs={true}>
      <CommonTable
        data={{
          data: (apiResponse?.data?.data as Schedule[]) || [],
          per_page: apiResponse?.data?.per_page || 10,
          total: apiResponse?.data?.total || 0,
          from: apiResponse?.data?.from || 1,
          to: apiResponse?.data?.to || 10,
          current_page: apiResponse?.data?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        columns={columns}
        customFilters={customFilters}
        setFilterOptions={setFilterOptions}
        showFilters={true}
        pagination={true}
        isLoading={isLoading}
        emptyMessage='No schedule found'
      />

      <ScheduleFormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={modalMode}
        schedule={selectedSchedule}
        partners={partners}
        workOrders={workOrders}
        onSuccess={() => {
          setIsModalOpen(false)
          router.refresh()
        }}
      />
    </CommonLayout>
  )
}

export default Schedules
