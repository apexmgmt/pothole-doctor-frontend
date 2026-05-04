'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import CommonTable from '@/components/erp/common/table'
import InvoiceTaskService from '@/services/api/invoices/invoice-tasks.service'
import { Column, Task } from '@/types'
import { formatDate } from '@/utils/date'
import { Description } from '@/components/ui/description'
import EditButton from '@/components/erp/common/buttons/EditButton'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import InvoiceAddTaskModal from './InvoiceAddTaskModal'

const InvoiceTasksModal = ({
  open,
  onOpenChange,
  invoiceId,
  clientId
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  clientId?: string
}) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiMeta, setApiMeta] = useState<any>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ per_page: 10, page: 1 })

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isFetchingTask, setIsFetchingTask] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTasks = async (filters = filterOptions) => {
    setIsLoading(true)

    try {
      const response = await InvoiceTaskService.index(invoiceId, filters)

      if (response.data) {
        setTasks(response.data.data || response.data)
        setApiMeta(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch invoice tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open && invoiceId) {
      fetchTasks(filterOptions)
    }
  }, [open, invoiceId, filterOptions])

  const handleOpenEdit = async (task: Task) => {
    setIsFetchingTask(true)

    try {
      const response = await InvoiceTaskService.show(invoiceId, task.id)
      const taskDetails = response.data || response

      setSelectedTask(taskDetails)
      setIsEditModalOpen(true)
    } catch {
      toast.error('Failed to load task details')
    } finally {
      setIsFetchingTask(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return
    setIsDeleting(true)

    try {
      await InvoiceTaskService.destroy(invoiceId, taskToDelete.id)
      toast.success('Task deleted successfully')
      setIsDeleteDialogOpen(false)
      setTaskToDelete(null)
      fetchTasks(filterOptions)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete task')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row: Task) => (
        <Badge
          variant={row.status === 'Completed' ? 'default' : row.status === 'In Progress' ? 'secondary' : 'destructive'}
        >
          {row.status || '—'}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'name',
      header: 'Task Name',
      cell: (row: Task) => <span className='font-medium'>{row.name || '—'}</span>,
      sortable: true
    },
    {
      id: 'task_type',
      header: 'Task Type',
      cell: (row: Task) => <span>{row.task_type?.name || '—'}</span>,
      sortable: false
    },
    {
      id: 'start_date',
      header: 'Start Date',
      cell: (row: Task) => <span>{formatDate(row.start_date) || '—'}</span>,
      sortable: true
    },
    {
      id: 'start_time',
      header: 'Start Time',
      cell: (row: Task) => <span>{row.start_time || '—'}</span>,
      sortable: false
    },
    {
      id: 'client',
      header: 'Customer',
      cell: (row: Task) => {
        const parts = [row.client?.first_name, row.client?.last_name].filter(Boolean)

        return <span>{parts.join(' ') || '—'}</span>
      },
      sortable: false
    },
    {
      id: 'employees',
      header: 'Assigned To',
      cell: (row: Task) =>
        row.employees && row.employees.length > 0 ? (
          <div className='flex flex-wrap gap-1'>
            {row.employees.map(emp => (
              <Badge key={emp.id} variant='outline'>
                {emp.first_name} {emp.last_name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className='text-muted-foreground text-xs'>—</span>
        ),
      sortable: false
    },
    {
      id: 'location',
      header: 'Location',
      cell: (row: Task) => <Description description={row.location} />,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Actions',
      headerAlign: 'center',
      size: 80,
      sortable: false,
      cell: (row: Task) => (
        <div className='flex items-center justify-center gap-2'>
          <EditButton tooltip='Edit Task' variant='icon' onClick={() => handleOpenEdit(row)} />
          <DeleteButton
            tooltip='Delete Task'
            variant='icon'
            onClick={() => {
              setTaskToDelete(row)
              setIsDeleteDialogOpen(true)
            }}
          />
        </div>
      )
    }
  ]

  return (
    <>
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Invoice Tasks'
        description='All tasks linked to this invoice.'
        maxWidth='7xl'
        isLoading={isFetchingTask}
        loadingMessage='Loading task details...'
        actions={
          <div className='flex gap-3'>
            <Button variant='default' size='sm' onClick={() => setIsAddTaskOpen(true)}>
              + Add Task
            </Button>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        }
      >
        <CommonTable
          data={{
            data: tasks,
            per_page: apiMeta?.per_page ?? filterOptions.per_page,
            total: apiMeta?.total ?? tasks.length,
            from: apiMeta?.from ?? 1,
            to: apiMeta?.to ?? tasks.length,
            current_page: apiMeta?.current_page ?? 1,
            last_page: apiMeta?.last_page ?? 1
          }}
          columns={columns}
          setFilterOptions={setFilterOptions}
          showFilters={false}
          pagination={true}
          isLoading={isLoading}
          emptyMessage='No tasks found for this invoice'
        />
      </CommonDialog>

      <InvoiceAddTaskModal
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        invoiceId={invoiceId}
        clientId={clientId}
        mode='create'
        onSuccess={() => {
          setIsAddTaskOpen(false)
          fetchTasks(filterOptions)
        }}
      />

      {selectedTask && (
        <InvoiceAddTaskModal
          open={isEditModalOpen}
          onOpenChange={open => {
            setIsEditModalOpen(open)
            if (!open) setSelectedTask(null)
          }}
          invoiceId={invoiceId}
          mode='edit'
          taskId={selectedTask.id}
          taskDetails={selectedTask}
          clientId={selectedTask.client_id}
          onSuccess={() => {
            setIsEditModalOpen(false)
            setSelectedTask(null)
            fetchTasks(filterOptions)
          }}
        />
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={open => {
          setIsDeleteDialogOpen(open)
          if (!open) setTaskToDelete(null)
        }}
        title='Delete Task'
        message={`Are you sure you want to delete "${taskToDelete?.name}"? This action cannot be undone.`}
        confirmButtonTitle='Delete'
        confirmButtonProps={{ className: 'bg-red-600 hover:bg-red-700 text-white' }}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  )
}

export default InvoiceTasksModal
