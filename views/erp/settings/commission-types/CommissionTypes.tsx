'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, Search, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, CommissionType, CommissionTypePayload, DataTableApiResponse } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import CommissionTypeService from '@/services/api/settings/commission_types.service'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'

const INLINE_CREATE_ID = '__inline_create__'

type CommissionTypeFormValues = {
  name: string
}

const emptyCommissionTypePayload: CommissionTypeFormValues = {
  name: ''
}

type CommissionTypeFieldErrors = Partial<Record<keyof CommissionTypeFormValues, string>>

const CommissionTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingCommissionTypeId, setEditingCommissionTypeId] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateCommissionType, setCanCreateCommissionType] = useState<boolean>(false)
  const [canEditCommissionType, setCanEditCommissionType] = useState<boolean>(false)
  const [canDeleteCommissionType, setCanDeleteCommissionType] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<CommissionTypeFormValues>({
    defaultValues: emptyCommissionTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Commission').then(result => setCanCreateCommissionType(result))
    hasPermission('Update Commission').then(result => setCanEditCommissionType(result))
    hasPermission('Delete Commission').then(result => setCanDeleteCommissionType(result))
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

    try {
      CommissionTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch commission types')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the commission types!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Commission Types'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): CommissionTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: CommissionTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof CommissionTypeFormValues

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
    setEditingCommissionTypeId(null)
    reset(emptyCommissionTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const commissionType = (apiResponse?.data as CommissionType[] | undefined)?.find(item => item.id === id)

    if (!commissionType) {
      toast.error('Commission type not found')

      return
    }

    setInlineMode('edit')
    setEditingCommissionTypeId(id)
    reset({
      name: commissionType.name || ''
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingCommissionTypeId(null)
    reset(emptyCommissionTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: CommissionTypeFormValues) => {
    clearErrors()

    const payload: CommissionTypePayload = {
      name: values.name
    }

    try {
      if (inlineMode === 'create') {
        const response = await CommissionTypeService.store(payload)
        const createdCommissionType = response?.data as CommissionType | undefined

        setApiResponse(prev => {
          if (!prev || !createdCommissionType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdCommissionType, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdCommissionType) {
          fetchData()
        }

        toast.success(response?.message || 'Commission type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingCommissionTypeId) {
        const response = await CommissionTypeService.update(editingCommissionTypeId, payload)
        const updatedCommissionType = response?.data as CommissionType | undefined

        if (updatedCommissionType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as CommissionType).id === editingCommissionTypeId ? updatedCommissionType : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Commission type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof CommissionTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteCommissionType = async (id: string) => {
    try {
      await CommissionTypeService.destroy(id)
        .then(() => {
          toast.success('Commission type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete commission type')
        })
    } catch {
      toast.error('Something went wrong while deleting the commission type!')
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

  const tableRows: CommissionType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            slug: '',
            created_at: '',
            updated_at: ''
          } as CommissionType,
          ...(((apiResponse?.data as CommissionType[]) || []) as CommissionType[])
        ] as CommissionType[])
      : (((apiResponse?.data as CommissionType[]) || []) as CommissionType[])

  const renderInlineNameField = () => {
    const fieldError = errors.name?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-40'>
        <CustomFormField<CommissionTypeFormValues>
          name='name'
          placeholder='Enter commission type name'
          register={register}
          rules={{
            required: 'Commission type name is required',
            minLength: { value: 2, message: 'Commission type name must be at least 2 characters' }
          }}
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

  const isInlineRow = (row: CommissionType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: CommissionType) => inlineMode === 'edit' && editingCommissionTypeId === row.id
  const shouldRenderInlineRow = (row: CommissionType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: CommissionType, rowIndex: number | undefined) => {
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
      cell: (row: CommissionType) => (shouldRenderInlineRow(row) ? renderInlineNameField() : <span>{row.name}</span>),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: CommissionType) => (
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
            <div className='flex items-center justify-center gap-2'>
              {(canEditCommissionType || canDeleteCommissionType) && (
                <ThreeDotButton
                  buttons={[
                    canEditCommissionType && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Commission Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeleteCommissionType && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Commission Type'
                        variant='text'
                        onClick={() => handleDeleteCommissionType(row.id)}
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
        <InputGroup>
          <InputGroupInput
            placeholder='Search...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className='lg:w-80 min-w-0'
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
      {canCreateCommissionType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Commission Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Commission Types' noTabs={true}>
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
        emptyMessage='No commission type found'
      />
    </CommonLayout>
  )
}

export default CommissionTypes
