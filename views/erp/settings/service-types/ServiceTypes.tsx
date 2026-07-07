'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, ServiceType, ServiceTypePayload } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ServiceTypeService from '@/services/api/settings/service_types.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type ServiceTypeFormValues = {
  name: string
  is_editable: '1' | '0'
  wasted_percent: number
  abbreviation: string
}

const emptyServiceTypePayload: ServiceTypeFormValues = {
  name: '',
  is_editable: '1',
  wasted_percent: 0,
  abbreviation: ''
}

type ServiceTypeFieldErrors = Partial<Record<keyof ServiceTypeFormValues, string>>

const ServiceTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<ServiceType> | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingServiceTypeId, setEditingServiceTypeId] = useState<string | null>(null)
  const [canCreateServiceType, setCanCreateServiceType] = useState<boolean>(false)
  const [canEditServiceType, setCanEditServiceType] = useState<boolean>(false)
  const [canDeleteServiceType, setCanDeleteServiceType] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<ServiceTypeFormValues>({
    defaultValues: emptyServiceTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Service Type').then(result => setCanCreateServiceType(result))
    hasPermission('Update Service Type').then(result => setCanEditServiceType(result))
    hasPermission('Delete Service Type').then(result => setCanDeleteServiceType(result))
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

        return newOptions
      })
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  const fetchData = async () => {
    setIsLoading(true)

    ServiceTypeService.index(filterOptions)
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch service types')
      })
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Service Types'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): ServiceTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: ServiceTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof ServiceTypeFormValues

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
    setEditingServiceTypeId(null)
    reset(emptyServiceTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const serviceType = (apiResponse?.data as ServiceType[] | undefined)?.find(item => item.id === id)

    if (!serviceType) {
      toast.error('Service type not found')

      return
    }

    setInlineMode('edit')
    setEditingServiceTypeId(id)
    reset({
      name: serviceType.name || '',
      is_editable: String(serviceType.is_editable) === '0' ? '0' : '1',
      wasted_percent: Number(serviceType.wasted_percent || 0),
      abbreviation: serviceType.abbreviation || ''
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingServiceTypeId(null)
    reset(emptyServiceTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: ServiceTypeFormValues) => {
    clearErrors()

    const payload: ServiceTypePayload = {
      name: values.name,
      is_editable: Number(values.is_editable) as 1 | 0,
      wasted_percent: Number(values.wasted_percent),
      abbreviation: values.abbreviation
    }

    try {
      if (inlineMode === 'create') {
        const response = await ServiceTypeService.store(payload)
        const createdServiceType = response?.data as ServiceType | undefined

        setApiResponse(prev => {
          if (!prev || !createdServiceType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdServiceType, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdServiceType) {
          fetchData()
        }

        toast.success(response?.message || 'Service type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingServiceTypeId) {
        const response = await ServiceTypeService.update(editingServiceTypeId, payload)
        const updatedServiceType = response?.data as ServiceType | undefined

        if (updatedServiceType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as ServiceType).id === editingServiceTypeId ? updatedServiceType : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Service type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof ServiceTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteServiceType = async (id: string) => {
    try {
      await ServiceTypeService.destroy(id)
        .then(() => {
          toast.success('Service type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete service type')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the service type!')
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

  const tableRows: ServiceType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            is_editable: 1,
            wasted_percent: 0,
            abbreviation: '',
            created_at: '',
            updated_at: ''
          } as ServiceType,
          ...(((apiResponse?.data as ServiceType[]) || []) as ServiceType[])
        ] as ServiceType[])
      : (((apiResponse?.data as ServiceType[]) || []) as ServiceType[])

  const renderInlineField = (
    field: keyof ServiceTypeFormValues,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<ServiceTypeFormValues>>[0]['rules'],
    type: 'text' | 'number' | 'select' = 'text',
    selectOptions?: Array<{ value: string; label: string }>
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-34'>
        <CustomFormField<ServiceTypeFormValues>
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

  const isInlineRow = (row: ServiceType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: ServiceType) => inlineMode === 'edit' && editingServiceTypeId === row.id
  const shouldRenderInlineRow = (row: ServiceType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: ServiceType, rowIndex: number | undefined) => {
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
      cell: (row: ServiceType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter service type name', {
            required: 'Service type name is required',
            minLength: { value: 2, message: 'Service type name must be at least 2 characters' }
          })
        ) : (
          <span>{row.name}</span>
        ),
      sortable: true
    },
    {
      id: 'wasted_percent',
      header: 'Wasted Percent',
      cell: (row: ServiceType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'wasted_percent',
            '0',
            {
              required: 'Wasted percent is required',
              min: { value: 0, message: 'Must be at least 0' },
              max: { value: 100, message: 'Must be at most 100' },
              valueAsNumber: true
            },
            'number'
          )
        ) : (
          <span>{row.wasted_percent}</span>
        ),
      sortable: true
    },
    {
      id: 'abbreviation',
      header: 'Abbreviation',
      cell: (row: ServiceType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('abbreviation', 'Enter abbreviation', {
            required: 'Abbreviation is required',
            minLength: { value: 1, message: 'Abbreviation is required' }
          })
        ) : (
          <span>{row.abbreviation}</span>
        ),
      sortable: true
    },
    {
      id: 'is_editable',
      header: 'Is Editable',
      cell: (row: ServiceType) =>
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
          <span>{row.is_editable ? 'Yes' : 'No'}</span>
        ),
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: ServiceType) => (
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
              {(canEditServiceType || (canDeleteServiceType && Number(row.is_editable) === 1)) && (
                <ThreeDotButton
                  buttons={[
                    canEditServiceType && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Service Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeleteServiceType && !isInlineEditing && Number(row.is_editable) === 1 && (
                      <DeleteButton
                        tooltip='Delete Service Type'
                        variant='text'
                        onClick={() => handleDeleteServiceType(row.id)}
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
        <TableSearch value={searchValue} onChange={setSearchValue} placeholder='Search...' className='lg:w-80 min-w-0' />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateServiceType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Service Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Service Types' noTabs={true}>
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
        emptyMessage='No service type found'
      />
    </CommonLayout>
  )
}

export default ServiceTypes
