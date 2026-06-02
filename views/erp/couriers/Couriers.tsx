'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, Search, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Courier, CourierPayload } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import CourierService from '@/services/api/couriers.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'

const INLINE_CREATE_ID = '__inline_create__'

const emptyCourierPayload: CourierPayload = {
  name: '',
  email: '',
  contact_number: '',
  website: '',
  fax: ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/
const WEBSITE_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/

type CourierFieldErrors = Partial<Record<keyof CourierPayload, string>>

const Couriers: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingCourierId, setEditingCourierId] = useState<string | null>(null)
  const [canCreateCourier, setCanCreateCourier] = useState<boolean>(false)
  const [canEditCourier, setCanEditCourier] = useState<boolean>(false)
  const [canDeleteCourier, setCanDeleteCourier] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<CourierPayload>({
    defaultValues: emptyCourierPayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Courier').then(result => setCanCreateCourier(result))
    hasPermission('Update Courier').then(result => setCanEditCourier(result))
    hasPermission('Delete Courier').then(result => setCanDeleteCourier(result))
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

    CourierService.index(filterOptions)
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        console.error('Error fetching couriers:', error)
      })
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Couriers'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): CourierFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: CourierFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof CourierPayload

      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        nextErrors[typedField] = messages[0]
      } else if (typeof messages === 'string') {
        nextErrors[typedField] = messages
      }
    })

    return nextErrors
  }

  const handleOpenCreateModal = () => {
    setInlineMode('create')
    setEditingCourierId(null)
    reset(emptyCourierPayload)
    clearErrors()
  }

  const handleOpenEditModal = async (id: string) => {
    const courier = (apiResponse?.data as Courier[] | undefined)?.find(item => item.id === id)

    if (!courier) {
      toast.error('Courier not found')

      return
    }

    setInlineMode('edit')
    setEditingCourierId(id)
    reset({
      name: courier.name || '',
      email: courier.email || '',
      contact_number: courier.contact_number || '',
      website: courier.website || '',
      fax: courier.fax || ''
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingCourierId(null)
    reset(emptyCourierPayload)
    clearErrors()
  }

  const handleInlineSubmit = async (values: CourierPayload) => {
    clearErrors()

    try {
      if (inlineMode === 'create') {
        const response = await CourierService.store(values)
        const createdCourier = response?.data as Courier | undefined

        if (createdCourier) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: [createdCourier, ...(prev.data || [])],
              total: (prev.total || 0) + 1,
              to: Math.min((prev.to || 0) + 1, (prev.total || 0) + 1)
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Courier created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingCourierId) {
        const response = await CourierService.update(editingCourierId, values)
        const updatedCourier = response?.data as Courier | undefined

        if (updatedCourier) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item => ((item as Courier).id === editingCourierId ? updatedCourier : item))
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Courier updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof CourierPayload, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Something went wrong!')
    }
  }

  const handleDeleteCourier = async (id: string) => {
    try {
      await CourierService.destroy(id)
        .then(() => {
          toast.success('Courier deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete courier')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the courier!')
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

  const tableRows: Courier[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            email: '',
            contact_number: '',
            website: '',
            fax: ''
          } as Courier,
          ...(((apiResponse?.data as Courier[]) || []) as Courier[])
        ] as Courier[])
      : (((apiResponse?.data as Courier[]) || []) as Courier[])

  const renderInlineField = (
    field: keyof CourierPayload,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<CourierPayload>>[0]['rules'],
    type: 'text' | 'email' = 'text'
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-42'>
        <CustomFormField<CourierPayload>
          name={field}
          type={type}
          placeholder={placeholder}
          register={register}
          rules={rules}
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

  const isInlineRow = (row: Courier) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: Courier) => inlineMode === 'edit' && editingCourierId === row.id
  const shouldRenderInlineRow = (row: Courier) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: Courier, rowIndex: number | undefined) => {
        if (isInlineRow(row)) {
          return <span className='text-gray'>New</span>
        }

        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Name',
      cell: (row: Courier) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter courier name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })
        ) : (
          <span>{row.name}</span>
        ),
      sortable: true
    },
    {
      id: 'email',
      header: 'Email',
      cell: (row: Courier) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'email',
            'Enter email address',
            {
              required: 'Email is required',
              pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' }
            },
            'email'
          )
        ) : (
          <span>{row.email}</span>
        ),
      sortable: true
    },
    {
      id: 'contact_number',
      header: 'Contact Number',
      cell: (row: Courier) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('contact_number', 'Enter contact number', {
            required: 'Contact number is required',
            pattern: { value: PHONE_PATTERN, message: 'Enter a valid phone number' }
          })
        ) : (
          <span>{row.contact_number}</span>
        ),
      sortable: false
    },
    {
      id: 'website',
      header: 'Website',
      cell: (row: Courier) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('website', 'https://example.com', {
            pattern: {
              value: WEBSITE_PATTERN,
              message: 'Enter a valid URL'
            }
          })
        ) : row.website ? (
          <a href={row.website} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline'>
            {row.website}
          </a>
        ) : (
          <span> - </span>
        ),
      sortable: false
    },
    {
      id: 'fax',
      header: 'Fax',
      cell: (row: Courier) =>
        shouldRenderInlineRow(row) ? renderInlineField('fax', 'Enter fax number') : <span>{row.fax}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: Courier) => (
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
            (canEditCourier || canDeleteCourier) && (
              <ThreeDotButton
                buttons={[
                  canEditCourier && !isInlineEditing && (
                    <EditButton
                      tooltip='Edit Courier Information'
                      onClick={() => handleOpenEditModal(row.id)}
                      variant='text'
                    />
                  ),
                  canDeleteCourier && !isInlineEditing && (
                    <DeleteButton tooltip='Delete Courier' variant='text' onClick={() => handleDeleteCourier(row.id)} />
                  )
                ]}
              />
            )
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
      <div className='flex items-center gap-2 lg:flex-0 flex-1 sm:max-w-80! '>
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
      {canCreateCourier && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Courier</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Couriers' noTabs={true}>
      <CommonTable
        columns={columns}
        data={{
          data: tableRows,
          per_page: apiResponse?.per_page || 10,
          total: apiResponse?.total || 0,
          from: apiResponse?.from || 1,
          to: apiResponse?.to || 10,
          current_page: apiResponse?.current_page || 1,
          last_page: apiResponse?.last_page || 1
        }}
        isLoading={isLoading}
        setFilterOptions={setFilterOptions}
        customFilters={customFilters}
      />
    </CommonLayout>
  )
}

export default Couriers
