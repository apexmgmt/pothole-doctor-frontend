'use client'

import { useEffect, useState } from 'react'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommonTable from '@/components/erp/common/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Description } from '@/components/ui/description'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Client, Column, DataTableApiResponse, Staff, Task, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { formatDate } from '@/utils/date'
import ClientService from '@/services/api/clients/clients.service'
import StaffService from '@/services/api/staff.service'
import TaskService from '@/services/api/tasks.service'
import TaskReminderService from '@/services/api/settings/task_reminders.service'
import TaskTypeService from '@/services/api/settings/task_types.service'
import CreateOrEditTaskModal from '@/views/erp/tasks/CreateOrEditTaskModal'

const ClientTasks = ({ clientId }: { clientId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, client_id: clientId })

  // Modal form data — loaded once on first use
  const [modalDataLoaded, setModalDataLoaded] = useState(false)
  const [staffs, setStaffs] = useState<Staff[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [taskReminders, setTaskReminders] = useState<TaskReminder[]>([])
  const [taskReminderChannels, setTaskReminderChannels] = useState<TaskReminderChannel[]>([])

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
      TaskService.index({ ...filterOptions, client_id: clientId })
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching tasks')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching tasks!')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const loadModalData = async () => {
    if (modalDataLoaded) return

    try {
      const [staffsRes, clientsRes, taskTypesRes, taskRemindersRes, taskReminderChannelsRes] = await Promise.allSettled(
        [
          StaffService.getAll(),
          ClientService.getAll('customer'),
          TaskTypeService.getAll(),
          TaskReminderService.index(),
          TaskReminderService.getReminderChannels()
        ]
      )

      if (staffsRes.status === 'fulfilled') setStaffs(staffsRes.value.data || [])
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || [])
      if (taskTypesRes.status === 'fulfilled') setTaskTypes(taskTypesRes.value.data || [])
      if (taskRemindersRes.status === 'fulfilled') setTaskReminders(taskRemindersRes.value.data || [])
      if (taskReminderChannelsRes.status === 'fulfilled')
        setTaskReminderChannels(taskReminderChannelsRes.value.data || [])

      setModalDataLoaded(true)
    } catch {
      toast.error('Failed to load task form data')
    }
  }

  const handleOpenCreateModal = async () => {
    await loadModalData()
    setModalMode('create')
    setSelectedTaskId(null)
    setSelectedTask(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    await loadModalData()
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
    } catch {
      toast.error('Something went wrong while fetching the task details!')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTaskId(null)
    setSelectedTask(null)
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await TaskService.destroy(id)
        .then(() => {
          toast.success('Task deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete task')
        })
    } catch {
      toast.error('Something went wrong while deleting the task!')
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
      id: 'name',
      header: 'Task Name',
      cell: (row: Task) => <span className='font-medium'>{row?.name || ''}</span>,
      sortable: true
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
      sortable: false
    },
    {
      id: 'employees',
      header: 'Assigned To',
      cell: (row: Task) => (
        <div className='flex flex-wrap gap-1'>
          {row.employees && row.employees.length > 0 ? (
            row.employees.map(emp => (
              <Badge key={emp.id} variant='outline'>
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
      id: 'location',
      header: 'Event Location',
      cell: (row: Task) => <Description description={row.location} />,
      sortable: false
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: (row: Task) => <span className='font-medium'>{row?.comment || ''}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Task) => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <EditButton key='edit' tooltip='Edit Task' onClick={() => handleOpenEditModal(row.id)} variant='text' />,
              <DeleteButton
                key='delete'
                tooltip='Delete Task'
                variant='text'
                onClick={() => handleDeleteTask(row.id)}
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Task
      </Button>
    </div>
  )

  return (
    <>
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
        emptyMessage='No tasks found'
      />

      <CreateOrEditTaskModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        taskId={selectedTaskId || undefined}
        taskDetails={selectedTask || undefined}
        onSuccess={() => {
          fetchData()
          handleModalClose()
        }}
        staffs={staffs}
        clients={clients}
        taskTypes={taskTypes}
        taskReminders={taskReminders}
        taskReminderChannels={taskReminderChannels}
        defaultClientId={clientId}
      />
    </>
  )
}

export default ClientTasks
