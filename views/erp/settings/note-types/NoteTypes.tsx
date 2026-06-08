'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, NoteType, NoteTypePayload } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import NoteTypeService from '@/services/api/settings/note_types.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type NoteTypeFormValues = {
  name: string
  status: '1' | '0'
}

const emptyNoteTypePayload: NoteTypeFormValues = {
  name: '',
  status: '1'
}

type NoteTypeFieldErrors = Partial<Record<keyof NoteTypeFormValues, string>>

const NoteTypes: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingNoteTypeId, setEditingNoteTypeId] = useState<string | null>(null)
  const [canCreateNoteType, setCanCreateNoteType] = useState<boolean>(false)
  const [canEditNoteType, setCanEditNoteType] = useState<boolean>(false)
  const [canDeleteNoteType, setCanDeleteNoteType] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<NoteTypeFormValues>({
    defaultValues: emptyNoteTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Note Type').then(result => setCanCreateNoteType(result))
    hasPermission('Update Note Type').then(result => setCanEditNoteType(result))
    hasPermission('Delete Note Type').then(result => setCanDeleteNoteType(result))
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
      NoteTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch note types')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the note types!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Note Types'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): NoteTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: NoteTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof NoteTypeFormValues

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
    setEditingNoteTypeId(null)
    reset(emptyNoteTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const noteType = (apiResponse?.data as NoteType[] | undefined)?.find(item => item.id === id)

    if (!noteType) {
      toast.error('Note type not found')

      return
    }

    setInlineMode('edit')
    setEditingNoteTypeId(id)
    reset({
      name: noteType.name || '',
      status: Number(noteType.status) === 1 ? '1' : '0'
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingNoteTypeId(null)
    reset(emptyNoteTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: NoteTypeFormValues) => {
    clearErrors()

    const payload: NoteTypePayload = {
      name: values.name,
      status: inlineMode === 'create' ? 1 : values.status === '1' ? 1 : 0
    }

    try {
      if (inlineMode === 'create') {
        const response = await NoteTypeService.store(payload)
        const createdNoteType = response?.data as NoteType | undefined

        setApiResponse(prev => {
          if (!prev || !createdNoteType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdNoteType, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdNoteType) {
          fetchData()
        }

        toast.success(response?.message || 'Note type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingNoteTypeId) {
        const response = await NoteTypeService.update(editingNoteTypeId, payload)
        const updatedNoteType = response?.data as NoteType | undefined

        if (updatedNoteType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as NoteType).id === editingNoteTypeId ? updatedNoteType : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Note type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof NoteTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteNoteType = async (id: string) => {
    try {
      await NoteTypeService.destroy(id)
        .then(() => {
          toast.success('Note type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete note type')
        })
    } catch {
      toast.error('Something went wrong while deleting the note type!')
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

  const tableRows: NoteType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            status: 1,
            created_at: '',
            updated_at: ''
          } as NoteType,
          ...(((apiResponse?.data as NoteType[]) || []) as NoteType[])
        ] as NoteType[])
      : (((apiResponse?.data as NoteType[]) || []) as NoteType[])

  const renderInlineField = (
    field: keyof NoteTypeFormValues,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<NoteTypeFormValues>>[0]['rules'],
    type: 'text' | 'select' = 'text',
    selectOptions?: Array<{ value: string; label: string }>
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-34'>
        <CustomFormField<NoteTypeFormValues>
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

  const isInlineRow = (row: NoteType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: NoteType) => inlineMode === 'edit' && editingNoteTypeId === row.id
  const shouldRenderInlineRow = (row: NoteType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: NoteType, rowIndex: number | undefined) => {
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
      cell: (row: NoteType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter note type name', {
            required: 'Note type name is required',
            minLength: { value: 2, message: 'Note type name must be at least 2 characters' }
          })
        ) : (
          <span>{row.name}</span>
        ),
      sortable: true
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: NoteType) =>
        inlineMode === 'edit' && isEditingRow(row) ? (
          renderInlineField(
            'status',
            'Select status',
            {
              required: 'Status is required'
            },
            'select',
            [
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' }
            ]
          )
        ) : (
          <span
            className={`font-medium ${isInlineRow(row) || Number(row.status) === 1 ? 'text-green-600' : 'text-red-600'}`}
          >
            {isInlineRow(row) || Number(row.status) === 1 ? 'Active' : 'Inactive'}
          </span>
        ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: NoteType) => (
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
              {(canEditNoteType || canDeleteNoteType) && (
                <ThreeDotButton
                  buttons={[
                    canEditNoteType && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Note Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeleteNoteType && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Note Type'
                        variant='text'
                        onClick={() => handleDeleteNoteType(row.id)}
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
      {canCreateNoteType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Note Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Note Types' noTabs={true}>
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
        emptyMessage='No note type found'
      />
    </CommonLayout>
  )
}

export default NoteTypes
