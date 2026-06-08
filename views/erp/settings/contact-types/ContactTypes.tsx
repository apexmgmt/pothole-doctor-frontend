'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { useRouter, useSearchParams } from 'next/navigation'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, ContactType, ContactTypePayload, DataTableApiResponse, PaymentTerm } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import { hasPermission } from '@/utils/role-permission'
import CustomFormField from '@/components/form/CustomFormField'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type ContactTypeFormValues = {
  name: string
  payment_term_id: string
  material_labor_down_payment: number
  material_down_payment: number
  labor_down_payment: number
}

const emptyContactTypePayload: ContactTypeFormValues = {
  name: '',
  payment_term_id: '',
  material_labor_down_payment: 0,
  material_down_payment: 0,
  labor_down_payment: 0
}

type ContactTypeFieldErrors = Partial<Record<keyof ContactTypeFormValues, string>>

const ContactTypes: React.FC<{ payment_terms: PaymentTerm[] }> = ({ payment_terms }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingContactTypeId, setEditingContactTypeId] = useState<string | null>(null)
  const [canCreateContactType, setCanCreateContactType] = useState<boolean>(false)
  const [canEditContactType, setCanEditContactType] = useState<boolean>(false)
  const [canDeleteContactType, setCanDeleteContactType] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<ContactTypeFormValues>({
    defaultValues: emptyContactTypePayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')

    hasPermission('Create Contact Type').then(result => setCanCreateContactType(result))
    hasPermission('Update Contact Type').then(result => setCanEditContactType(result))
    hasPermission('Delete Contact Type').then(result => setCanDeleteContactType(result))
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
      ContactTypeService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch contact types')
        })
    } catch {
      setIsLoading(false)
      toast.error('Something went wrong while fetching the contact types!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Contact Types'))
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): ContactTypeFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: ContactTypeFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof ContactTypeFormValues

      if (Array.isArray(messages) && typeof messages[0] === 'string') {
        nextErrors[typedField] = messages[0]
      } else if (typeof messages === 'string') {
        nextErrors[typedField] = messages
      }
    })

    return nextErrors
  }

  const getPaymentTermName = (row: ContactType) => {
    if (row.payment_term?.name) {
      return row.payment_term.name
    }

    const term = payment_terms.find(item => String(item.id) === String(row.payment_term_id))

    return term?.name || 'N/A'
  }

  const handleOpenCreateInline = () => {
    setInlineMode('create')
    setEditingContactTypeId(null)
    reset(emptyContactTypePayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const contactType = (apiResponse?.data as ContactType[] | undefined)?.find(item => item.id === id)

    if (!contactType) {
      toast.error('Contact type not found')

      return
    }

    setInlineMode('edit')
    setEditingContactTypeId(id)
    reset({
      name: contactType.name || '',
      payment_term_id: String(contactType.payment_term_id || contactType.payment_term?.id || ''),
      material_labor_down_payment: Number(contactType.material_labor_down_payment || 0),
      material_down_payment: Number(contactType.material_down_payment || 0),
      labor_down_payment: Number(contactType.labor_down_payment || 0)
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingContactTypeId(null)
    reset(emptyContactTypePayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: ContactTypeFormValues) => {
    clearErrors()

    const payload: ContactTypePayload = {
      name: values.name,
      payment_term_id: values.payment_term_id,
      material_labor_down_payment: Number(values.material_labor_down_payment),
      material_down_payment: Number(values.material_down_payment),
      labor_down_payment: Number(values.labor_down_payment)
    }

    try {
      if (inlineMode === 'create') {
        const response = await ContactTypeService.store(payload)
        const createdContactType = response?.data as ContactType | undefined

        setApiResponse(prev => {
          if (!prev || !createdContactType) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdContactType, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdContactType) {
          fetchData()
        }

        toast.success(response?.message || 'Contact type created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingContactTypeId) {
        const response = await ContactTypeService.update(editingContactTypeId, payload)
        const updatedContactType = response?.data as ContactType | undefined

        if (updatedContactType) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as ContactType).id === editingContactTypeId ? updatedContactType : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Contact type updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof ContactTypeFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const handleDeleteContactType = async (id: string) => {
    try {
      await ContactTypeService.destroy(id)
        .then(() => {
          toast.success('Contact type deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete contact type')
        })
    } catch {
      toast.error('Something went wrong while deleting the contact type!')
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

  const tableRows: ContactType[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            payment_term_id: '',
            material_labor_down_payment: 0,
            material_down_payment: 0,
            labor_down_payment: 0,
            created_at: '',
            updated_at: ''
          } as ContactType,
          ...(((apiResponse?.data as ContactType[]) || []) as ContactType[])
        ] as ContactType[])
      : (((apiResponse?.data as ContactType[]) || []) as ContactType[])

  const renderInlineField = (
    field: keyof ContactTypeFormValues,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<ContactTypeFormValues>>[0]['rules'],
    type: 'text' | 'number' | 'select' = 'text',
    selectOptions?: Array<{ value: string; label: string }>
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='min-w-34'>
        <CustomFormField<ContactTypeFormValues>
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

  const isInlineRow = (row: ContactType) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: ContactType) => inlineMode === 'edit' && editingContactTypeId === row.id
  const shouldRenderInlineRow = (row: ContactType) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: ContactType, rowIndex: number | undefined) => {
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
      cell: (row: ContactType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter contact type name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
          })
        ) : (
          <span>{row.name}</span>
        ),
      sortable: true
    },
    {
      id: 'payment_term',
      header: 'Payment Term',
      cell: (row: ContactType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'payment_term_id',
            'Select a payment term',
            {
              required: 'Payment term is required'
            },
            'select',
            payment_terms.map(term => ({ value: String(term.id), label: term.name }))
          )
        ) : (
          <span>{getPaymentTermName(row)}</span>
        ),
      sortable: true,
      size: 228
    },
    {
      id: 'material_labor_down_payment',
      header: 'Material & Labor Down Payment',
      cell: (row: ContactType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'material_labor_down_payment',
            '0',
            {
              required: 'Material & labor down payment is required',
              min: { value: 0, message: 'Material & labor down payment must be at least 0' },
              max: { value: 100, message: 'Material & labor down payment must not exceed 100' },
              valueAsNumber: true
            },
            'number'
          )
        ) : (
          <span>{`${row.material_labor_down_payment ?? 0}%`}</span>
        ),
      sortable: true,
      size: 56
    },
    {
      id: 'material_down_payment',
      header: 'Material Down Payment',
      cell: (row: ContactType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'material_down_payment',
            '0',
            {
              required: 'Material down payment is required',
              min: { value: 0, message: 'Material down payment must be at least 0' },
              max: { value: 100, message: 'Material down payment must not exceed 100' },
              valueAsNumber: true
            },
            'number'
          )
        ) : (
          <span>{`${row.material_down_payment ?? 0}%`}</span>
        ),
      sortable: true,
      size: 56
    },
    {
      id: 'labor_down_payment',
      header: 'Labor Down Payment',
      cell: (row: ContactType) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'labor_down_payment',
            '0',
            {
              required: 'Labor down payment is required',
              min: { value: 0, message: 'Labor down payment must be at least 0' },
              max: { value: 100, message: 'Labor down payment must not exceed 100' },
              valueAsNumber: true
            },
            'number'
          )
        ) : (
          <span>{`${row.labor_down_payment ?? 0}%`}</span>
        ),
      sortable: true,
      size: 56
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: ContactType) => (
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
              {(canEditContactType || canDeleteContactType) && (
                <ThreeDotButton
                  buttons={[
                    canEditContactType && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Contact Type Information'
                        onClick={() => handleOpenEditInline(row.id)}
                        variant='text'
                      />
                    ),
                    canDeleteContactType && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Contact Type'
                        variant='text'
                        onClick={() => handleDeleteContactType(row.id)}
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
      {canCreateContactType && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Contact Type</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Contact Types' noTabs={true}>
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
        emptyMessage='No contact type found'
      />
    </CommonLayout>
  )
}

export default ContactTypes
