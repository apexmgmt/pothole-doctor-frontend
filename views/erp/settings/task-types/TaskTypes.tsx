'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PlusIcon, Search } from 'lucide-react'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, TaskType } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { toast } from 'sonner'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import TaskTypeService from '@/services/api/settings/task_types.service'
import CreateOrEditTaskTypeModal from './CreateOrEditTaskTypeModal'

const TaskTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
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
      TaskTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch task types')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the task types!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Task Types'))
  }, [filterOptions])

  // Transform API data to match table format
  const taskTypesData = apiResponse?.data
    ? apiResponse.data.map((taskType: TaskType, index: number) => {
        return {
          id: taskType.id,
          index: (apiResponse?.from || 1) + index,
          name: taskType.name,
          is_editable: taskType.is_editable ? true : false
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedTaskTypeId(null)
    setSelectedTaskType(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedTaskTypeId(id)

    // Fetch task type details
    try {
      const response = await TaskTypeService.show(id)
      setSelectedTaskType(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch task type details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTaskTypeId(null)
    setSelectedTaskType(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'is_editable',
      header: 'Editable',
      cell: row => (
        <span className={`font-medium ${row.is_editable ? '' : 'text-red-600'}`}>{row.is_editable ? 'Yes' : 'No'}</span>
      ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => {
        return row.is_editable ? (
          <div className='flex items-center justify-center gap-2'>
            <EditButton
              tooltip='Edit Task Type Information'
              onClick={() => handleOpenEditModal(row.id)}
              variant='icon'
            />
            <DeleteButton tooltip='Delete Task Type' variant='icon' onClick={() => handleDeleteTaskType(row.id)} />
          </div>
        ) : null
      },
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteTaskType = async (id: string) => {
    try {
      TaskTypeService.destroy(id)
        .then(response => {
          toast.success('Task type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete task type')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the task type!')
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Task Type
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Task Types' noTabs={true}>
        <CommonTable
          data={{
            data: taskTypesData,
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
          emptyMessage='No task type found'
        />
      </CommonLayout>

      <CreateOrEditTaskTypeModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        taskTypeId={selectedTaskTypeId || undefined}
        taskTypeDetails={selectedTaskType || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default TaskTypes
