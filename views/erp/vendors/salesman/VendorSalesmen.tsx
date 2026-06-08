import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Check, PlusIcon, X } from 'lucide-react'

import { toast } from 'sonner'

import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import EditButton from '@/components/erp/common/buttons/EditButton'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, VendorSalesman, VendorSalesmanPayload } from '@/types'

import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import VendorSalesmanService from '@/services/api/vendors/vendor-salesman.service'
import CustomFormField from '@/components/form/CustomFormField'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type SalesmanFormValues = {
  name: string
  email: string
  phone: string
  ext: string
  comment: string
}

const emptySalesmanPayload: SalesmanFormValues = {
  name: '',
  email: '',
  phone: '',
  ext: '',
  comment: ''
}

type SalesmanFieldErrors = Partial<Record<keyof SalesmanFormValues, string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/

const VendorSalesmen = ({ vendorId }: { vendorId: string }) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingSalesmanId, setEditingSalesmanId] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<any>({ page: 1, per_page: 10, searchable_id: vendorId })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<SalesmanFormValues>({
    defaultValues: emptySalesmanPayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
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
      VendorSalesmanService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
          toast.error('Error fetching salesmen')
        })
    } catch {
      setIsLoading(false)
      toast.error('Error fetching salesmen')
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterOptions])

  const getFieldErrorsFromApi = (error: any): SalesmanFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: SalesmanFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof SalesmanFormValues

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
    setEditingSalesmanId(null)
    reset(emptySalesmanPayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const salesman = (apiResponse?.data as VendorSalesman[] | undefined)?.find(item => item.id === id)

    if (!salesman) {
      toast.error('Salesman not found')

      return
    }

    setInlineMode('edit')
    setEditingSalesmanId(id)
    reset({
      name: salesman.name || '',
      email: salesman.email || '',
      phone: salesman.phone || '',
      ext: salesman.ext || '',
      comment: salesman.comment || ''
    })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingSalesmanId(null)
    reset(emptySalesmanPayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: SalesmanFormValues) => {
    clearErrors()

    const payload: VendorSalesmanPayload = {
      vendor_id: vendorId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      ext: values.ext,
      comment: values.comment
    }

    try {
      if (inlineMode === 'create') {
        const response = await VendorSalesmanService.store(payload)
        const createdSalesman = response?.data as VendorSalesman | undefined

        setApiResponse(prev => {
          if (!prev || !createdSalesman) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdSalesman, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdSalesman) {
          fetchData()
        }

        toast.success(response?.message || 'Salesman added successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingSalesmanId) {
        const response = await VendorSalesmanService.update(editingSalesmanId, payload)
        const updatedSalesman = response?.data as VendorSalesman | undefined

        if (updatedSalesman) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as VendorSalesman).id === editingSalesmanId ? updatedSalesman : item
              )
            }
          })
        } else {
          fetchData()
        }

        toast.success(response?.message || 'Salesman updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof SalesmanFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Failed to save salesman')
    }
  }

  const handleDeleteSalesman = async (id: string) => {
    try {
      await VendorSalesmanService.destroy(id)
        .then(() => {
          toast.success('Salesman deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete salesman')
        })
    } catch {
      toast.error('Something went wrong while deleting the salesman!')
    }
  }

  const handleClearFilters = () => {
    setFilterOptions({ searchable_id: vendorId, page: 1, per_page: 10 })
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const tableRows: VendorSalesman[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            vendor_id: vendorId,
            name: '',
            email: '',
            phone: '',
            ext: '',
            comment: '',
            created_at: '',
            updated_at: '',
            deleted_at: null
          } as VendorSalesman,
          ...(((apiResponse?.data as VendorSalesman[]) || []) as VendorSalesman[])
        ] as VendorSalesman[])
      : (((apiResponse?.data as VendorSalesman[]) || []) as VendorSalesman[])

  const renderInlineField = (
    field: keyof SalesmanFormValues,
    placeholder: string,
    rules?: Parameters<typeof CustomFormField<SalesmanFormValues>>[0]['rules'],
    type: 'text' | 'email' | 'tel' = 'text'
  ) => {
    const fieldError = errors[field]?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''
    const hasInlineErrors = Object.keys(errors).length > 0

    return (
      <div className='w-full min-w-0'>
        <CustomFormField<SalesmanFormValues>
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

  const isInlineRow = (row: VendorSalesman) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: VendorSalesman) => inlineMode === 'edit' && editingSalesmanId === row.id
  const shouldRenderInlineRow = (row: VendorSalesman) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: (row: VendorSalesman, rowIndex: number | undefined) => {
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
      header: 'Name',
      cell: (row: VendorSalesman) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('name', 'Enter name', {
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
      cell: (row: VendorSalesman) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'email',
            'Enter email',
            {
              required: 'Email is required',
              pattern: {
                value: EMAIL_REGEX,
                message: 'Please enter a valid email address'
              }
            },
            'email'
          )
        ) : (
          <span>{row.email}</span>
        ),
      sortable: true
    },
    {
      id: 'phone',
      header: 'Phone',
      cell: (row: VendorSalesman) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField(
            'phone',
            'Enter phone',
            {
              required: 'Phone is required',
              pattern: {
                value: PHONE_REGEX,
                message: 'Please enter a valid phone number'
              }
            },
            'tel'
          )
        ) : (
          <span>{row.phone}</span>
        ),
      sortable: true
    },
    {
      id: 'ext',
      header: 'Ext',
      cell: (row: VendorSalesman) =>
        shouldRenderInlineRow(row) ? renderInlineField('ext', 'Enter ext') : <span>{row.ext || ' - '}</span>,
      sortable: true
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: (row: VendorSalesman) =>
        shouldRenderInlineRow(row) ? (
          renderInlineField('comment', 'Enter comment (optional)')
        ) : (
          <span>{row.comment || ' - '}</span>
        ),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: VendorSalesman) => (
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
            <ThreeDotButton
              buttons={[
                !isInlineEditing && (
                  <EditButton tooltip='Edit Salesman' onClick={() => handleOpenEditInline(row.id)} variant='text' />
                ),
                !isInlineEditing && (
                  <DeleteButton tooltip='Delete Salesman' variant='text' onClick={() => handleDeleteSalesman(row.id)} />
                )
              ]}
            />
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
        {/* {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light h-7'>
            Clear
          </Button>
        )} */}
      </div>
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90 h-7'
        onClick={handleOpenCreateInline}
        disabled={isInlineEditing}
      >
        <PlusIcon className='w-4 h-4' />
        <span className='hidden min-[480px]:block'>Add Salesman</span>
      </Button>
    </div>
  )

  return (
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
      emptyMessage='No salesman found'
    />
  )
}

export default VendorSalesmen
