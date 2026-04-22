'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Column, DataTableApiResponse, WorkOrder } from '@/types'
import { formatDate } from '@/utils/date'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'

const getStatusVariant = (
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' | 'success' | 'pending' => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in progress':
    case 'in_progress':
      return 'info'
    case 'pending':
      return 'pending'
    case 'cancelled':
    case 'void':
      return 'destructive'
    case 'overdue':
      return 'warning'
    case 'new':
      return 'secondary'
    default:
      return 'outline'
  }
}

const ClientWorkOrders = ({ clientId }: { clientId: string }) => {
  const router = useRouter()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, client_id: clientId })

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        const newOptions = { ...prev, client_id: clientId }

        if (searchValue && searchValue.trim() !== '') {
          newOptions.search = searchValue
        } else {
          delete newOptions.search
        }

        delete newOptions.page

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    try {
      WorkOrderService.index({ ...filterOptions, client_id: clientId })
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching work orders')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching work orders!')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      await WorkOrderService.destroy(id)
        .then(() => {
          toast.success('Work order deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete work order')
        })
    } catch {
      toast.error('Something went wrong while deleting the work order!')
    }
  }

  const columns: Column[] = [
    {
      id: 'work_order_number',
      header: 'WO #',
      cell: (row: WorkOrder) => (
        <span
          className='font-medium hover:underline cursor-pointer'
          onClick={() => router.push(`/erp/work-orders/${row.id}`)}
        >
          {row.work_order_number?.toString().padStart(6, '0') || 'N/A'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'title',
      header: 'Title',
      cell: (row: WorkOrder) => <span className='font-medium'>{row.title}</span>,
      sortable: true
    },
    {
      id: 'issue_date',
      header: 'Issue Date',
      cell: (row: WorkOrder) => <span className='font-medium'>{formatDate(row.issue_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'due_date',
      header: 'Due Date',
      cell: (row: WorkOrder) => <span className='font-medium'>{formatDate(row.due_date || '') || '—'}</span>,
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: WorkOrder) => (
        <Badge variant={getStatusVariant(row.status)} className='capitalize'>
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'total',
      header: 'Total',
      cell: (row: WorkOrder) => (
        <span className='font-medium'>${row.total != null ? Number(row.total).toFixed(2) : '0.00'}</span>
      ),
      sortable: true
    },
    {
      id: 'profit',
      header: 'Profit',
      cell: (row: WorkOrder) => {
        const profit = row.profit ?? 0
        const isPositive = profit >= 0

        return (
          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${Number(profit).toFixed(2)}
          </span>
        )
      },
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: WorkOrder) => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <EditButton
                key='edit'
                tooltip='View / Edit Work Order'
                onClick={() => router.push(`/erp/work-orders/${row.id}`)}
                variant='text'
              />,
              <DeleteButton
                key='delete'
                tooltip='Delete Work Order'
                variant='text'
                onClick={() => handleDeleteWorkOrder(row.id)}
              />
            ]}
          />
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-between w-full'>
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
    </div>
  )

  return (
    <CommonTable
      data={{
        data: (apiResponse?.data as WorkOrder[]) || [],
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
      emptyMessage='No work orders found'
    />
  )
}

export default ClientWorkOrders
