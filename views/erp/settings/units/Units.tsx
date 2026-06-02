'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, Search, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Unit, UnitPayload } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import UnitService from '@/services/api/settings/units.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'

const INLINE_CREATE_ID = '__inline_create__'

type UnitFormValues = {
  name: string
  group: string | 'uom' | 'measure'
}

const Units: React.FC<{ group?: string | 'uom' | 'measure' }> = ({ group }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null)
  const [canCreateUnit, setCanCreateUnit] = useState<boolean>(false)
  const [canEditUnit, setCanEditUnit] = useState<boolean>(false)
  const [canDeleteUnit, setCanDeleteUnit] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<UnitFormValues>({
    defaultValues: {
      name: '',
      group: (group || '') as UnitFormValues['group']
    }
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Unit').then(result => setCanCreateUnit(result))
    hasPermission('Update Unit').then(result => setCanEditUnit(result))
    hasPermission('Delete Unit').then(result => setCanDeleteUnit(result))
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
      const params = { ...filterOptions, ...(group ? { group } : {}) }

      UnitService.index(params)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch units')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the units!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Units'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): Partial<Record<keyof UnitFormValues, string>> => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: Partial<Record<keyof UnitFormValues, string>> = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof UnitFormValues

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
    setEditingUnitId(null)
    reset({
      name: '',
      group: (group || '') as UnitFormValues['group']
    })
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const unit = (apiResponse?.data as Unit[] | undefined)?.find(item => item.id === id)

    if (!unit) {
      toast.error('Unit not found')

      return
    }

    setInlineMode('edit')
    setEditingUnitId(id)
    reset({
      name: unit.name || '',
      group: (group || unit.group || '') as UnitFormValues['group']
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingUnitId(null)
    reset({
      name: '',
      group: (group || '') as UnitFormValues['group']
    })
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: UnitFormValues) => {
    clearErrors()

    const payload: UnitPayload = {
      name: values.name,
      group: (group || values.group || '') as UnitPayload['group']
    }

    try {
      if (inlineMode === 'create') {
        const response = await UnitService.store(payload)
        const createdUnit = response?.data as Unit | undefined

        setApiResponse(prev => {
          if (!prev || !createdUnit) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdUnit, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdUnit) {
          fetchData()
        }

        toast.success(response?.message || 'Unit created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingUnitId) {
        const response = await UnitService.update(editingUnitId, payload)
        const updatedUnit = response?.data as Unit | undefined

        if (updatedUnit) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item => ((item as Unit).id === editingUnitId ? updatedUnit : item))
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Unit updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof UnitFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteUnit = async (id: string) => {
    try {
      await UnitService.destroy(id)
        .then(() => {
          toast.success('Unit deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete unit')
        })
    } catch {
      toast.error('Something went wrong while deleting the unit!')
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

  const tableRows: Unit[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            group: (group || '') as Unit['group'],
            created_at: '',
            updated_at: ''
          } as Unit,
          ...(((apiResponse?.data as Unit[]) || []) as Unit[])
        ] as Unit[])
      : (((apiResponse?.data as Unit[]) || []) as Unit[])

  const renderInlineNameField = () => {
    const fieldError = errors.name?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-40'>
        <CustomFormField<UnitFormValues>
          name='name'
          placeholder='Enter unit name'
          register={register}
          rules={{
            required: 'Unit name is required',
            minLength: { value: 2, message: 'Unit name must be at least 2 characters' }
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

  const isInlineRow = (row: Unit) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: Unit) => inlineMode === 'edit' && editingUnitId === row.id
  const shouldRenderInlineRow = (row: Unit) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: Unit, rowIndex: number | undefined) => {
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
      cell: (row: Unit) => (shouldRenderInlineRow(row) ? renderInlineNameField() : <span>{row.name}</span>),
      sortable: true
    },
    {
      id: 'group',
      header: 'Group',
      cell: (row: Unit) => <span className='capitalize'>{group || row.group}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Unit) => (
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
              {(canEditUnit || canDeleteUnit) && (
                <ThreeDotButton
                  buttons={[
                    canEditUnit && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Unit Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeleteUnit && !isInlineEditing && (
                      <DeleteButton tooltip='Delete Unit' variant='text' onClick={() => handleDeleteUnit(row.id)} />
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
      {canCreateUnit && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Unit</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title={group === 'uom' ? 'Uom Units' : 'Measure Units'} noTabs={true}>
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
        emptyMessage='No unit found'
      />
    </CommonLayout>
  )
}

export default Units
