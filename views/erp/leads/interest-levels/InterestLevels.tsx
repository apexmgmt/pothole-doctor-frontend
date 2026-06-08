'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, InterestLevel, InterestLevelPayload } from '@/types'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import InterestLevelService from '@/services/api/interest_levels.service'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'
import EditButton from '@/components/erp/common/buttons/EditButton'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type InterestLevelFormValues = {
  name: string
}

const emptyInterestLevelPayload: InterestLevelFormValues = {
  name: ''
}

type InterestLevelFieldErrors = Partial<Record<keyof InterestLevelFormValues, string>>

const InterestLevels: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingInterestLevelId, setEditingInterestLevelId] = useState<string | null>(null)
  const [canCreateInterestLevel, setCanCreateInterestLevel] = useState<boolean>(false)
  const [canEditInterestLevel, setCanEditInterestLevel] = useState<boolean>(false)
  const [canDeleteInterestLevel, setCanDeleteInterestLevel] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<InterestLevelFormValues>({
    defaultValues: emptyInterestLevelPayload
  })

  const isInlineEditing = inlineMode !== null

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    // Check permissions
    hasPermission('Create Interest Level').then(result => {
      setCanCreateInterestLevel(result)
    })
    hasPermission('Update Interest Level').then(result => {
      setCanEditInterestLevel(result)
    })
    hasPermission('Delete Interest Level').then(result => {
      setCanDeleteInterestLevel(result)
    })
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
      InterestLevelService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          console.error('Error fetching interest levels:', error)
        })
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching interest levels:', error)
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Interest Levels'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): InterestLevelFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: InterestLevelFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof InterestLevelFormValues

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
    setEditingInterestLevelId(null)
    reset(emptyInterestLevelPayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const interestLevel = (apiResponse?.data as InterestLevel[] | undefined)?.find(item => item.id === id)

    if (!interestLevel) {
      toast.error('Interest level not found')

      return
    }

    setInlineMode('edit')
    setEditingInterestLevelId(id)
    reset({ name: interestLevel.name || '' })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingInterestLevelId(null)
    reset(emptyInterestLevelPayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: InterestLevelFormValues) => {
    clearErrors()

    const payload: InterestLevelPayload = {
      name: values.name
    }

    try {
      if (inlineMode === 'create') {
        const response = await InterestLevelService.store(payload)
        const createdInterestLevel = response?.data as InterestLevel | undefined

        setApiResponse(prev => {
          if (!prev || !createdInterestLevel) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdInterestLevel, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdInterestLevel) {
          fetchData()
        }

        toast.success(response?.message || 'Interest level created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingInterestLevelId) {
        const response = await InterestLevelService.update(editingInterestLevelId, payload)
        const updatedInterestLevel = response?.data as InterestLevel | undefined

        if (updatedInterestLevel) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as InterestLevel).id === editingInterestLevelId ? updatedInterestLevel : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Interest level updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof InterestLevelFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Failed to save interest level')
    }
  }

  const tableRows: InterestLevel[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            created_at: '',
            updated_at: ''
          } as InterestLevel,
          ...(((apiResponse?.data as InterestLevel[]) || []) as InterestLevel[])
        ] as InterestLevel[])
      : (((apiResponse?.data as InterestLevel[]) || []) as InterestLevel[])

  const isInlineRow = (row: InterestLevel) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: InterestLevel) => inlineMode === 'edit' && editingInterestLevelId === row.id
  const shouldRenderInlineRow = (row: InterestLevel) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const renderNameField = () => {
    const fieldError = errors.name?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''

    return (
      <div className='w-full min-w-0'>
        <CustomFormField<InterestLevelFormValues>
          name='name'
          type='text'
          placeholder='Enter interest level name'
          register={register}
          rules={{
            required: 'Interest level name is required',
            minLength: { value: 2, message: 'Must be at least 2 characters' }
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

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: InterestLevel, rowIndex: number | undefined) => {
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
      cell: (row: InterestLevel) => (shouldRenderInlineRow(row) ? renderNameField() : <span>{row.name}</span>),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: InterestLevel) => (
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
              {(canEditInterestLevel || canDeleteInterestLevel) && (
                <ThreeDotButton
                  buttons={[
                    canEditInterestLevel && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Interest Level'
                        variant='text'
                        onClick={() => handleOpenEditInline(row.id)}
                      />
                    ),
                    canDeleteInterestLevel && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Interest Level'
                        variant='text'
                        onClick={() => handleDeleteInterestLevel(row.id)}
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleDeleteInterestLevel = async (id: string) => {
    try {
      await InterestLevelService.destroy(id)
        .then(response => {
          toast.success('Interest level deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete interest level')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the interest level!')
    }
  }

  // Check if filters are active (excluding pagination)
  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  // Custom filters component
  const customFilters = (
    <div className='flex items-center justify-between w-full gap-2.5'>
      <div className='flex items-center gap-2 lg:flex-0 flex-1 sm:max-w-80! '>
        <TableSearch value={searchValue} onChange={setSearchValue} placeholder='Search...' className='lg:w-80 min-w-0' />
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )}
      </div>
      {canCreateInterestLevel && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Interest Level</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Interest Levels' noTabs={true}>
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
        emptyMessage='No interest level found'
      />
    </CommonLayout>
  )
}

export default InterestLevels
