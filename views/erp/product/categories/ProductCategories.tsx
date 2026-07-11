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
import { Column, DataTableApiResponse, ProductCategory, ProductCategoryPayload } from '@/types'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import ProductCategoryService from '@/services/api/products/product_categories.service'
import CustomFormField from '@/components/form/CustomFormField'
import EditButton from '@/components/erp/common/buttons/EditButton'
import TableSearch from '@/components/erp/common/TableSearch'

const INLINE_CREATE_ID = '__inline_create__'

type CategoryFormValues = {
  name: string
}

const emptyCategoryPayload: CategoryFormValues = {
  name: ''
}

type CategoryFieldErrors = Partial<Record<keyof CategoryFormValues, string>>

interface ProductCategoriesProps {
  initialData?: DataTableApiResponse<ProductCategory> | null
  permissions?: {
    canCreateCategory: boolean
    canEditCategory: boolean
    canDeleteCategory: boolean
  }
}

const ProductCategories: React.FC<ProductCategoriesProps> = ({ initialData, permissions }) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<ProductCategory> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [inlineMode, setInlineMode] = useState<'create' | 'edit' | null>(null)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  const canCreateCategory = permissions?.canCreateCategory ?? false
  const canEditCategory = permissions?.canEditCategory ?? false
  const canDeleteCategory = permissions?.canDeleteCategory ?? false

  const filterOptions = useMemo(() => ({
    ...getInitialFilters(searchParams)
  }), [searchParams])

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormValues>({
    defaultValues: emptyCategoryPayload
  })

  const isInlineEditing = inlineMode !== null

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    dispatch(setPageTitle('Manage Product Categories'))
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

  const getFieldErrorsFromApi = (error: any): CategoryFieldErrors => {
    const serverErrors = error?.errors

    if (!serverErrors || typeof serverErrors !== 'object') {
      return {}
    }

    const nextErrors: CategoryFieldErrors = {}

    Object.entries(serverErrors).forEach(([field, messages]) => {
      const typedField = field as keyof CategoryFormValues

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
    setEditingCategoryId(null)
    reset(emptyCategoryPayload)
    clearErrors()
  }

  const handleOpenEditInline = (id: string) => {
    const category = (apiResponse?.data as ProductCategory[] | undefined)?.find(item => item.id === id)

    if (!category) {
      toast.error('Product category not found')

      return
    }

    setInlineMode('edit')
    setEditingCategoryId(id)
    reset({ name: category.name || '' })
    clearErrors()
  }

  const handleInlineCancel = () => {
    setInlineMode(null)
    setEditingCategoryId(null)
    reset(emptyCategoryPayload)
    clearErrors()
  }

  const goToFirstPage = () => {
    setFilterOptions((prev: any) => {
      const next = { ...prev }

      delete next.page

      return next
    })
  }

  const handleInlineSubmit = async (values: CategoryFormValues) => {
    clearErrors()

    const payload: ProductCategoryPayload = {
      name: values.name,
      type: 'product'
    }

    try {
      if (inlineMode === 'create') {
        const response = await ProductCategoryService.store(payload)
        const createdCategory = response?.data as ProductCategory | undefined

        setApiResponse(prev => {
          if (!prev || !createdCategory) {
            return prev
          }

          const perPage = prev.per_page || 10
          const updatedTotal = (prev.total || 0) + 1
          const nextData = [createdCategory, ...(prev.data || [])].slice(0, perPage)

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

        if (!createdCategory) {
          router.refresh()
        }

        toast.success(response?.message || 'Product category created successfully')
        handleInlineCancel()

        return
      }

      if (inlineMode === 'edit' && editingCategoryId) {
        const response = await ProductCategoryService.update(editingCategoryId, payload)
        const updatedCategory = response?.data as ProductCategory | undefined

        if (updatedCategory) {
          setApiResponse(prev => {
            if (!prev) {
              return prev
            }

            return {
              ...prev,
              data: (prev.data || []).map(item =>
                (item as ProductCategory).id === editingCategoryId ? updatedCategory : item
              )
            }
          })
        } else {
          router.refresh()
        }

        toast.success(response?.message || 'Product category updated successfully')
        handleInlineCancel()
      }
    } catch (error: any) {
      const fieldErrors = getFieldErrorsFromApi(error)

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (message) {
          setError(field as keyof CategoryFormValues, {
            type: 'server',
            message
          })
        }
      })

      toast.error(error?.message || 'Operation failed')
    }
  }

  const tableRows: ProductCategory[] =
    inlineMode === 'create'
      ? ([
          {
            id: INLINE_CREATE_ID,
            name: '',
            type: 'product',
            created_at: '',
            updated_at: ''
          } as ProductCategory,
          ...(((apiResponse?.data as ProductCategory[]) || []) as ProductCategory[])
        ] as ProductCategory[])
      : (((apiResponse?.data as ProductCategory[]) || []) as ProductCategory[])

  const isInlineRow = (row: ProductCategory) => inlineMode === 'create' && row.id === INLINE_CREATE_ID
  const isEditingRow = (row: ProductCategory) => inlineMode === 'edit' && editingCategoryId === row.id
  const shouldRenderInlineRow = (row: ProductCategory) => isInlineRow(row) || isEditingRow(row)
  const hasInlineErrors = Object.keys(errors).length > 0

  const renderNameField = () => {
    const fieldError = errors.name?.message
    const fieldErrorMessage = typeof fieldError === 'string' ? fieldError : ''

    return (
      <div className='w-full min-w-0'>
        <CustomFormField<CategoryFormValues>
          name='name'
          type='text'
          placeholder='Enter category name'
          register={register}
          rules={{
            required: 'Category name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' }
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
      cell: (row: ProductCategory, rowIndex: number | undefined) => {
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
      cell: (row: ProductCategory) => (shouldRenderInlineRow(row) ? renderNameField() : <span>{row.name}</span>),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: (row: ProductCategory) => (
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
              {(canEditCategory || canDeleteCategory) && (
                <ThreeDotButton
                  buttons={[
                    canEditCategory && !isInlineEditing && (
                      <EditButton
                        tooltip='Edit Product Category'
                        variant='text'
                        onClick={() => handleOpenEditInline(row.id)}
                      />
                    ),
                    canDeleteCategory && !isInlineEditing && (
                      <DeleteButton
                        tooltip='Delete Product Category'
                        variant='text'
                        onClick={() => handleDeleteProductCategory(row.id)}
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
    setFilterOptions(getInitialFilters(searchParams))
    setSearchValue('')
  }

  const handleDeleteProductCategory = async (id: string) => {
    try {
      await ProductCategoryService.destroy(id)
        .then(response => {
          toast.success('Product category deleted successfully')
          router.refresh()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete product category')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the product category!')
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
      {canCreateCategory && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 h-7'
          onClick={handleOpenCreateInline}
          disabled={isInlineEditing}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Add Product Category</span>
        </Button>
      )}
    </div>
  )

  return (
    <CommonLayout title='Product Categories' noTabs={true}>
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
        emptyMessage='No product category found'
      />
    </CommonLayout>
  )
}

export default ProductCategories
