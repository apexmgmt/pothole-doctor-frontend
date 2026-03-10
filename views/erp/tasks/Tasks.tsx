'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Client, Column, DataTableApiResponse, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import TaskService from '@/services/api/tasks.service'
import { formatDate } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import CreateOrEditTaskModal from './CreateOrEditTaskModal'
import { hasPermission } from '@/utils/role-permission'
import { Description } from '@/components/ui/description'

const Tasks: React.FC<{
  staffs: Staff[]
  clients: Client[]
  taskTypes: TaskType[]
  taskReminders: TaskReminder[]
  taskReminderChannels: TaskReminderChannel[]
}> = ({ staffs, clients, taskTypes, taskReminders, taskReminderChannels }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateTask, setCanCreateTask] = useState<boolean>(false)
  const [canEditTask, setCanEditTask] = useState<boolean>(false)
  const [canDeleteTask, setCanDeleteTask] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Task').then(result => setCanCreateTask(result))
    hasPermission('Update Task').then(result => setCanEditTask(result))
    hasPermission('Delete Task').then(result => setCanDeleteTask(result))
  }, [])

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterOptions((prev: any) => {
        // Remove search if empty, otherwise set it
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

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)

    try {
      TaskService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching tasks:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Tasks'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedTaskId(null)
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedTaskId(id)

    try {
      TaskService.show(id)
        .then(response => {
          setSelectedTask(response.data)
          setIsModalOpen(true)
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch task details')
        })
    } catch (error) {
      toast.error('Something went wrong while fetching the task details!')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTaskId(null)
    setSelectedTask(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'status',
      header: 'Status',
      cell: row => (
        <Badge
          key={row.id}
          variant={row.status === 'Completed' ? 'default' : row.status === 'In Progress' ? 'secondary' : 'destructive'}
          className='mr-1 mb-1'
        >
          {row.status}
        </Badge>
      ),
      sortable: true
    },
    {
      id: 'task_type',
      header: 'Task Type',
      cell: (row: Task) => <span className='font-medium'>{row?.task_type?.name || ''}</span>,
      sortable: false
    },
    {
      id: 'start_date',
      header: 'Start Date',
      cell: (row: Task) => <span className='font-medium'>{formatDate(row?.start_date) || ''}</span>,
      sortable: true
    },
    {
      id: 'start_time',
      header: 'Start Time',
      cell: (row: Task) => <span className='font-medium'>{row?.start_time || ''}</span>,
      sortable: true
    },
    {
      id: 'created_by',
      header: 'Created By',
      cell: (row: Task) => {
        const parts = [row?.created_by?.first_name, row?.created_by?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: true
    },
    {
      id: 'created_at',
      header: 'Created Date',
      cell: (row: Task) => <span className='font-medium'>{formatDate(row?.created_at) || ''}</span>,
      sortable: true
    },
    {
      id: 'employees',
      header: 'Assigned To',
      cell: (row: Task) => (
        <div className='flex flex-wrap gap-1'>
          {row.employees && row.employees.length > 0 ? (
            row.employees.map(emp => (
              <Badge key={emp.id} variant='outline' className='mr-1 mb-1'>
                {emp.first_name} {emp.last_name}
              </Badge>
            ))
          ) : (
            <span className='text-gray-400'>-</span>
          )}
        </div>
      ),
      sortable: false
    },
    {
      id: 'company',
      header: 'Company Name',
      cell: (row: Task) => <span className='font-medium'>{row?.client?.company?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'client',
      header: 'Customer Name',
      cell: (row: Task) => {
        const parts = [row?.client?.first_name, row?.client?.last_name].filter(Boolean)

        return <span className='font-medium'>{parts.join(' ') || ''}</span>
      },
      sortable: true
    },
    {
      id: 'name',
      header: 'Task Name',
      cell: (row: Task) => <span className='font-medium'>{row?.name || ''}</span>,
      sortable: true
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: (row: Task) => <span className='font-medium'>{row?.comment || ''}</span>,
      sortable: true
    },
    {
      id: 'location',
      header: 'Event Location',
      cell: (row: Task) => <Description description={row.location} />,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditTask || canDeleteTask) && (
            <ThreeDotButton
              buttons={[
                ...(canEditTask
                  ? [
                      <EditButton
                        tooltip='Edit Task Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteTask
                  ? [<DeleteButton tooltip='Delete Task' variant='text' onClick={() => handleDeleteTask(row.id)} />]
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await TaskService.destroy(id)
        .then(response => {
          toast.success('Task deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete task')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the task!')
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  // Custom filters component
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
      {canCreateTask && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Task
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Tasks' noTabs={true}>
        <CommonTable
          data={{
            data: (apiResponse?.data as Task[]) || [],
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
          emptyMessage='No task found'
        />
      </CommonLayout>

      <CreateOrEditTaskModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        taskId={selectedTaskId || undefined}
        taskDetails={selectedTask || undefined}
        onSuccess={handleSuccess}
        staffs={staffs}
        clients={clients}
        taskTypes={taskTypes}
        taskReminders={taskReminders}
        taskReminderChannels={taskReminderChannels}
      />
    </>
  )
}

export default Tasks
