'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, ProductCategory } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import ProductCategoryService from '@/services/api/product_categories.service'
import CreateOrEditProductCategoryModal from './CreateOrEditProductCategoryModal'
import { hasPermission } from '@/utils/role-permission'

const ProductCategories: React.FC = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedProductCategoryId, setSelectedProductCategoryId] = useState<string | null>(null)
  const [selectedProductCategory, setSelectedProductCategory] = useState<ProductCategory | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateCategory, setCanCreateCategory] = useState<boolean>(false)
  const [canEditCategory, setCanEditCategory] = useState<boolean>(false)
  const [canDeleteCategory, setCanDeleteCategory] = useState<boolean>(false)

  // Set initial search value from filterOptions and check permissions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Category').then(result => setCanCreateCategory(result))
    hasPermission('Update Category').then(result => setCanEditCategory(result))
    hasPermission('Delete Category').then(result => setCanDeleteCategory(result))
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
      ProductCategoryService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch product categories')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching product categories!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Product Categories'))
  }, [filterOptions])

  // Transform API data to match table format
  const productCategoriesData = apiResponse?.data
    ? apiResponse.data.map((productCategory: ProductCategory, index: number) => {
        return {
          id: productCategory.id,
          index: (apiResponse?.from || 1) + index,
          name: productCategory.name
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedProductCategoryId(null)
    setSelectedProductCategory(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedProductCategoryId(id)

    // Fetch product category details
    try {
      const response = await ProductCategoryService.show(id)

      setSelectedProductCategory(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch product category details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProductCategoryId(null)
    setSelectedProductCategory(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  // Column definitions for CommonTable
  const columns: Column[] = [
    {
      id: 'index',
      header: '#',
      cell: row => <span className='text-gray'>{row.index}</span>,
      sortable: false,
      size: 16
    },
    {
      id: 'name',
      header: 'Title',
      cell: row => <span className='font-medium'>{row.name}</span>,
      sortable: true
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          {(canEditCategory || canDeleteCategory) && (
            <ThreeDotButton
              buttons={[
                ...(canEditCategory
                  ? [
                      <EditButton
                        tooltip='Edit Product Category Information'
                        onClick={() => handleOpenEditModal(row.id)}
                        variant='text'
                      />
                    ]
                  : []),
                ...(canDeleteCategory
                  ? [
                      <DeleteButton
                        tooltip='Delete Product Category'
                        variant='text'
                        onClick={() => handleDeleteProductCategory(row.id)}
                      />
                    ]
                  : [])
              ]}
            />
          )}
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

  const handleDeleteProductCategory = async (id: string) => {
    try {
      await ProductCategoryService.destroy(id)
        .then(response => {
          toast.success('Product category deleted successfully')
          fetchData()
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
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        <InputGroup>
          <InputGroupInput
            placeholder='Search...'
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className='w-80'
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
      {canCreateCategory && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          Add Product Category
        </Button>
      )}
    </div>
  )

  return (
    <>
      <CommonLayout title='Product Categories' noTabs={true}>
        <CommonTable
          data={{
            data: productCategoriesData,
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

      <CreateOrEditProductCategoryModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        productCategoryId={selectedProductCategoryId || undefined}
        productCategoryDetails={selectedProductCategory || undefined}
        onSuccess={handleSuccess}
      />
    </>
  )
}

export default ProductCategories
