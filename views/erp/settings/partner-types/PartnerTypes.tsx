'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, Search, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, PartnerType, PartnerTypePayload } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'

const INLINE_CREATE_ID = '__inline_create__'

type PartnerTypeFormValues = {
  name: string
}

const emptyPartnerTypePayload: PartnerTypeFormValues = {
  name: ''
}

type PartnerTypeFieldErrors = Partial<Record<keyof PartnerTypeFormValues, string>>

const PartnerTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingPartnerTypeId, setEditingPartnerTypeId] = useState<string | null>(null)
  const [canCreatePartnerType, setCanCreatePartnerType] = useState<boolean>(false)
  const [canEditPartnerType, setCanEditPartnerType] = useState<boolean>(false)
  const [canDeletePartnerType, setCanDeletePartnerType] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<PartnerTypeFormValues>({
    defaultValues: emptyPartnerTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Contractor Type').then(result => setCanCreatePartnerType(result))
    hasPermission('Update Contractor Type').then(result => setCanEditPartnerType(result))
    hasPermission('Delete Contractor Type').then(result => setCanDeletePartnerType(result))
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
      PartnerTypesService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch contractor types')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the contractor types!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Contractor Types'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): PartnerTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: PartnerTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof PartnerTypeFormValues

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
    setEditingPartnerTypeId(null)
    reset(emptyPartnerTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const partnerType = (apiResponse?.data as PartnerType[] | undefined)?.find(item => item.id === id)

    if (!partnerType) {
      toast.error('Contractor type not found')

      return
    }

    setInlineMode('edit')
    setEditingPartnerTypeId(id)
    reset({
      name: partnerType.name || ''
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingPartnerTypeId(null)
    reset(emptyPartnerTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: PartnerTypeFormValues) => {
    clearErrors()

    const payload: PartnerTypePayload = {
      name: values.name
    }

    try {
      if (inlineMode === 'create') {
        const response = await PartnerTypesService.store(payload)
        const createdPartnerType = response?.data as PartnerType | undefined

        setApiResponse(prev => {
          if (!prev || !createdPartnerType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdPartnerType, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdPartnerType) {
          fetchData()
        }

        toast.success(response?.message || 'Contractor type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingPartnerTypeId) {
        const response = await PartnerTypesService.update(editingPartnerTypeId, payload)
        const updatedPartnerType = response?.data as PartnerType | undefined

        if (updatedPartnerType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as PartnerType).id === editingPartnerTypeId ? updatedPartnerType : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Contractor type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof PartnerTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeletePartnerType = async (id: string) => {
    try {
      await PartnerTypesService.destroy(id)
        .then(() => {
          toast.success('Contractor type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete contractor type')
        })
    } catch {
      toast.error('Something went wrong while deleting the contractor type!')
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

  const tableRows: PartnerType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            created_at: '',
            updated_at: ''
          } as PartnerType,
          ...(((apiResponse?.data as PartnerType[]) || []) as PartnerType[])
        ] as PartnerType[])
      : (((apiResponse?.data as PartnerType[]) || []) as PartnerType[])

  const renderInlineNameField = () => {
    const fieldError = errors.name?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='w-full min-w-0'>
        <CustomFormField<PartnerTypeFormValues>
          name='name'
          placeholder='Enter contractor type name'
          register={register}
          rules={{
            required: 'Contractor type name is required',
            minLength: { value: 2, message: 'Contractor type name must be at least 2 characters' }
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

  const isInlineRow = (row: PartnerType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: PartnerType) => inlineMode === 'edit' && editingPartnerTypeId === row.id
  const shouldRenderInlineRow = (row: PartnerType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: PartnerType, rowIndex: number | undefined) => {
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
      cell: (row: PartnerType) => (shouldRenderInlineRow(row) ? renderInlineNameField() : <span>{row.name}</span>),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: PartnerType) => (
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
              {(canEditPartnerType || canDeletePartnerType) && (
                <ThreeDotButton
                  buttons={[
                    canEditPartnerType && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Contractor Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeletePartnerType && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Contractor Type'
                        variant='text'
                        onClick={() => handleDeletePartnerType(row.id)}
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
      {canCreatePartnerType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Contractor Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Contractor Types' noTabs={true}>
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
        emptyMessage='No contractor type found'
      />
    </CommonLayout>
  )
}

export default PartnerTypes
