'use client'

import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
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

const Schedules: React.FC<{ workOrders?: WorkOrder[]; partners?: Partner[] }> = ({
  workOrders = [],
  partners = []
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreate, setCanCreate] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Schedule').then(setCanCreate)
    hasPermission('Update Schedule').then(setCanEdit)
    hasPermission('Delete Schedule').then(setCanDelete)
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

        if (newOptions.page) delete newOptions.page

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      ScheduleService.index(filterOptions)
        .then(response => {
          setApiResponse(response)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(error.message || 'Failed to fetch schedules')
        })
    } catch (error: any) {
      setIsLoading(false)
      toast.error(error.message || 'Failed to fetch schedules')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Schedules'))
  }, [filterOptions])

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteSchedule = async (id: string) => {
    try {
      await ScheduleService.destroy(id)
        .then(() => {
          toast.success('Schedule deleted successfully')
          fetchData()
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
      cell: (row: Schedule) => <span className='font-medium'>{row.title || ''}</span>,
      sortable: true
    },
    {
      id: 'work_order_number',
      header: 'WO#',
      cell: (row: Schedule) => <span className='font-medium'>{row.work_order?.work_order_number || ''}</span>,
      sortable: true
    },
    {
      id: 'company',
      header: 'Company',
      cell: (row: Schedule) => <span className='font-medium'>{row.client?.company?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'job_type',
      header: 'Job Type',
      cell: (row: Schedule) => <span className='font-medium'>{row.service_type?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'contractor',
      header: 'Contractor',
      cell: (row: Schedule) => {
        const parts = [row.contractor?.first_name, row.contractor?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: true
    },
    {
      id: 'starting_date',
      header: 'Start Date',
      cell: (row: Schedule) => <span className='font-medium'>{formatDate(row.starting_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'ending_date',
      header: 'End Date',
      cell: (row: Schedule) => <span className='font-medium'>{formatDate(row.ending_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'starting_time',
      header: 'Start Time',
      cell: (row: Schedule) => <span className='font-medium'>{row.starting_time || ''}</span>,
      sortable: true
    },
    {
      id: 'ending_time',
      header: 'End Time',
      cell: (row: Schedule) => <span className='font-medium'>{row.ending_time || ''}</span>,
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

          return <span className='font-medium'>{diff}</span>
        }

        return <span className='font-medium'>-</span>
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
      sortable: false
    },
    {
      id: 'internal_commands',
      header: 'Internal Notes',
      cell: (row: Schedule) => <Description description={row?.internal_commands ?? ''} />,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Schedule) => (
        <div className='flex items-center justify-center gap-2'>
          {(canEdit || canDelete) && (
            <ThreeDotButton
              buttons={[
                ...(canEdit ? [<EditButton tooltip='Edit Schedule' onClick={() => {}} variant='text' />] : []),
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
    <CommonLayout title='Schedules' noTabs={true}>
      <CommonTable
        data={{
          data: (apiResponse?.data as Schedule[]) || [],
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
        emptyMessage='No schedule found'
      />
    </CommonLayout>
  )
}

export default Schedules
