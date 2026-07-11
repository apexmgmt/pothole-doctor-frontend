'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, TaskType, TaskTypePayload } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters } from '@/utils/utility'
import TaskTypeService from '@/services/api/settings/task_types.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CustomFormField from '@/components/form/CustomFormField'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type TaskTypeFormValues = {
  name: string
  is_editable: '1' | '0'
}

const emptyTaskTypePayload: TaskTypeFormValues = {
  name: '',
  is_editable: '1'
}

type TaskTypeFieldErrors = Partial<Record<keyof TaskTypeFormValues, string>>
interface TaskTypesProps {
  initialData?: DataTableApiResponse<TaskType> | null
  permissions?: {
    canCreateType: boolean
    canEditType: boolean
    canDeleteType: boolean
    canRestoreType: boolean
  }
}

const TaskTypes: React.FC<TaskTypesProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<TaskType> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingTaskTypeId, setEditingTaskTypeId] = useState<string | null>(null)

  const canCreate = permissions?.canCreateType ?? false
  const canUpdate = permissions?.canEditType ?? false
  const canDelete = permissions?.canDeleteType ?? false

  const filterOptions = useMemo(
    () => ({
      ...getInitialFilters(searchParams)
    }),
    [searchParams]
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<TaskTypeFormValues>({
    defaultValues: emptyTaskTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Task Types'))
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

  const getFieldErrorsFromApi = (error: any): TaskTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: TaskTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof TaskTypeFormValues

      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        nextErrors[typedField] = messages[0]
      } else if (typeof messages === 'string') {
        nextErrors[typedField] = messages
      }
    })

    return nextErrors
  }

  const handleOpenCreateInline = () => {
    setInlineMode('create')
    setEditingTaskTypeId(null)
    reset(emptyTaskTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const taskType = (apiResponse?.data as TaskType[] | undefined)?.find(item => item.id === id)

    if (!taskType) {
      toast.error('Task type not found')

      return
    }

    setInlineMode('edit')
    setEditingTaskTypeId(id)
    reset({
      name: taskType.name || '',
      is_editable: Number(taskType.is_editable) === 1 ? '1' : '0'
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingTaskTypeId(null)
    reset(emptyTaskTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: TaskTypeFormValues) => {
    clearErrors()

    const payload: TaskTypePayload = {
      name: values.name,
      is_editable: values.is_editable === '1' ? 1 : 0
    }

    try {
      if (inlineMode === 'create') {
        const response = await TaskTypeService.store(payload)
        const createdTaskType = response?.data as TaskType | undefined

        setApiResponse(prev => {
          if (!prev || !createdTaskType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdTaskType, ...(prev.data || [])].slice(0, perPage)

          return {
            ...prev,
            data: nextData,
            total: updatedTotal,
            from: 1,
            to: nextData.length,
            current_page: 1,
            last_page: Math.max(1, Math.ceil(updatedTotal / perPage))
          }
        })

        goToFirstPage()

        if (!createdTaskType) {
          router.refresh()
        }

        toast.success(response?.message || 'Task type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingTaskTypeId) {
        const response = await TaskTypeService.update(editingTaskTypeId, payload)
        const updatedTaskType = response?.data as TaskType | undefined

        if (updatedTaskType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as TaskType).id === editingTaskTypeId ? updatedTaskType : item
              )
            }
          })
        } else {
          router.refresh()
        }

        toast.success(response?.message || 'Task type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof TaskTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteTaskType = async (id: string) => {
    try {
      await TaskTypeService.destroy(id)
        .then(() => {
          toast.success('Task type deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete task type')
        })
    } catch {
      toast.error('Something went wrong while deleting the task type!')
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const tableRows: TaskType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            is_editable: 1,
            created_at: '',
            updated_at: ''
          } as TaskType,
          ...(((apiResponse?.data as TaskType[]) || []) as TaskType[])
        ] as TaskType[])
      : (((apiResponse?.data as TaskType[]) || []) as TaskType[])

  const renderInlineField = (
    field: keyof TaskTypeFormValues,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<TaskTypeFormValues>>[0]['rules'],
    type: 'text' | 'select' = 'text',
    selectOptions?: Array<{ value: string; label: string }>
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-34'>
        <CustomFormField<TaskTypeFormValues>
          name={field}
          type={type}
          placeholder={placeholder}
          register={register}
          control={control}
          rules={rules}
          selectOptions={selectOptions}
          className={fieldErrorMessage ? 'border-red-500' : ''}
        />
        {hasInlineErrors && (
          <p className='mt-1 min-h-4 text-[11px] leading-4 text-red-500'>
            <span className={fieldErrorMessage ? '' : 'invisible'}>{fieldErrorMessage || 'placeholder'}</span>
          </p>
        )}
      </div>
    )
  }

  const isInlineRow = (row: TaskType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: TaskType) => inlineMode === 'edit' && editingTaskTypeId === row.id
  const shouldRenderInlineRow = (row: TaskType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: TaskType, rowIndex: number | undefined) => {
        if (isInlineRow(row)) {
          return <span className='text-gray'>New</span>
        }

        const from = apiResponse?.from || 1
        const offset = inlineMode === 'create' ? 1 : 0

        return <span className='text-gray'>{from + ((rowIndex || 0) - offset)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Title',
      cell: (row: TaskType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter task type name', {
            required: 'Task type name is required',
            minLength: { value: 2, message: 'Task type name must be at least 2 characters' }
          })
        ) : (
          <span>{row.name}</span>
        ),
      sortable: true
    },
    {
      id: 'is_editable',
      header: 'Editable',
      cell: (row: TaskType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'is_editable',
            'Select editable option',
            {
              required: 'Editable is required'
            },
            'select',
            [
              { value: '1', label: 'Yes' },
              { value: '0', label: 'No' }
            ]
          )
        ) : (
          <span className={`font-medium ${Number(row.is_editable) === 1 ? '' : 'text-red-600'}`}>
            {Number(row.is_editable) === 1 ? 'Yes' : 'No'}
          </span>
        ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: TaskType) => (
        <div className='flex flex-col items-center justify-start'>
          {shouldRenderInlineRow(row) ? (
            <div className='flex items-center justify-center gap-2'>
              <Button
                type='button'
                size='icon'
                className='h-6 w-6'
                onClick={handleSubmit(handleInlineSubmit)}
                disabled={isSubmitting}
              >
                <Check className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                size='icon'
                variant='outline'
                className='h-6 w-6 border-border text-light hover:bg-bg-3'
                onClick={handleInlineCancel}
                disabled={isSubmitting}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-end gap-2'>
              {(canUpdate || canDelete) && (
                <ThreeDotButton
                  buttons={[
                    canUpdate && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Task Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDelete && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Task Type'
                        variant='text'
                        onClick={() => handleDeleteTaskType(row.id)}
                      />
                    )
                  ]}
                />
              )}
            </div>
          )}
          {shouldRenderInlineRow(row) && hasInlineErrors && <div className='mt-1 min-h-4' />}
        </div>
      ),
      sortable: false,
      headerAlign: 'center',
      size: 30
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
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
      {canCreate && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Task Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Task Types' noTabs={true}>
      <CommonTable
        data={{
          data: tableRows,
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
  )
}

export default TaskTypes
