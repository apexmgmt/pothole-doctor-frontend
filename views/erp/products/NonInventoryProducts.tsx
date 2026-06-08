'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, ProductsProps } from '@/types'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import CreateEditViewNonInventoryProductModal from './CreateEditViewNonInventoryProductModal'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { hasPermission } from '@/utils/role-permission'
import TableSearch from '@/components/erp/common/TableSearch'
import CustomFormField from '@/components/form/CustomFormField'
import { formatCurrency } from '@/utils/currency'

const NonInventoryProducts: React.FC<ProductsProps> = ({
  productCategories,
  uomUnits,
  serviceTypes,
  vendors,
  isFromModal = false,
  selectedRows,
  setSelectedRows,
  hideTitle = false,
  hideActionButton = false
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [canCreateProduct, setCanCreateProduct] = useState<boolean>(false)
  const [canEditProduct, setCanEditProduct] = useState<boolean>(false)
  const [canDeleteProduct, setCanDeleteProduct] = useState<boolean>(false)
  const [canViewProduct, setCanViewProduct] = useState<boolean>(false)

  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    hasPermission('Create Product').then(result => setCanCreateProduct(result))
    hasPermission('Update Product').then(result => setCanEditProduct(result))
    hasPermission('Delete Product').then(result => setCanDeleteProduct(result))
    hasPermission('View Product').then(result => setCanViewProduct(result))
  }, [])

  // Debounced search update
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
      NonInventoryProductService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch non-inventory products')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching non-inventory products!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    if (!hideTitle) dispatch(setPageTitle('Manage Non-Inventory Products'))
  }, [filterOptions])

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedProductId(null)
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedProductId(id)

    try {
      const response = await NonInventoryProductService.show(id)

      setSelectedProduct(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch non-inventory product details')
    }
  }

  const handleOpenViewModal = async (id: string) => {
    setModalMode('view')
    setSelectedProductId(id)

    try {
      const response = await NonInventoryProductService.show(id)

      setSelectedProduct(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch non-inventory product details')
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedProductId(null)
    setSelectedProduct(null)
  }

  const handleSuccess = () => {
    fetchData()
    handleModalClose()
  }

  const handleCategoryChange = (value: string) => {
    setFilterOptions((prev: any) => {
      const newOptions = { ...prev }

      if (value === 'all') {
        delete newOptions.category_id
      } else {
        newOptions.category_id = value
      }

      return newOptions
    })
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await NonInventoryProductService.destroy(id)
        .then(() => {
          toast.success('Non-inventory product deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete non-inventory product')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the non-inventory product!')
    }
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const columns: Column[] = [
    ...((isFromModal
      ? [
          {
            id: 'select',
            header: '',
            cell: (row: Product) => (
              <Checkbox
                checked={selectedRows?.some((r: Product) => r.id === row.id)}
                onCheckedChange={checked => {
                  setSelectedRows?.((prev: Product[]) => {
                    if (checked) {
                      if (!prev.some(r => r.id === row.id)) return [...prev, row]

                      return prev
                    } else {
                      return prev.filter(r => r.id !== row.id)
                    }
                  })
                }}
              />
            ),
            sortable: false,
            size: 16
          }
        ]
      : []) as Column[]),
    {
      id: 'index',
      header: '#',
      cell: (row: Product, rowIndex: number | undefined) => {
        const from = apiResponse?.from || 1

        return <span className='text-gray'>{from + (rowIndex || 0)}</span>
      },
      sortable: false,
      size: 16
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (row: Product) => <span>{row?.vendor?.first_name ?? ''}</span>,
      sortable: false
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row: Product) => <span>{row?.category?.name ?? ''}</span>,
      sortable: false
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: (row: Product) => <span>{row.sku}</span>,
      sortable: true
    },
    {
      id: 'vendor_product_name',
      header: 'Product Name',
      cell: (row: Product) => <span>{row.vendor_product_name || row.private_product_name}</span>,
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: Product) => <span>{row.description}</span>,
      sortable: true
    },
    {
      id: 'vendor_style',
      header: 'Style',
      cell: (row: Product) => <span>{row.vendor_style || row.private_style}</span>,
      sortable: true
    },
    {
      id: 'vendor_color',
      header: 'Color',
      cell: (row: Product) => <span>{row.vendor_color || row.private_color}</span>,
      sortable: true
    },
    {
      id: 'selling_price',
      header: 'Product Price',
      cell: (row: Product) => (
        <span>
          {formatCurrency(Number(row?.selling_price || '0'))}/{row?.selling_unit?.name}
        </span>
      ),
      sortable: true
    },
    ...(!hideActionButton
      ? ([
          {
            id: 'actions',
            header: 'Action',
            cell: (row: Product) => (
              <div className='flex items-center justify-center gap-2'>
                {(canEditProduct || canDeleteProduct || canViewProduct) && (
                  <ThreeDotButton
                    buttons={[
                      ...(canViewProduct
                        ? [
                            <ViewButton
                              tooltip='View Product Information'
                              onClick={() => handleOpenViewModal(row.id)}
                              variant='text'
                            />
                          ]
                        : []),
                      ...(canEditProduct
                        ? [
                            <EditButton
                              tooltip='Edit Product Information'
                              onClick={() => handleOpenEditModal(row.id)}
                              variant='text'
                            />
                          ]
                        : []),
                      ...(canDeleteProduct
                        ? [
                            <DeleteButton
                              tooltip='Delete Product'
                              variant='text'
                              onClick={() => handleDeleteProduct(row.id)}
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
        ] as Column[])
      : [])
  ]

  const customFilters = (
    <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between w-full gap-2.5'>
      <div className='flex-1 flex flex-col lg:flex-row lg:items-center gap-2'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-2 w-full lg:max-w-240'>
          {/* Global search filter */}
          <TableSearch
            name='product-search'
            label='Search'
            value={searchValue}
            onChange={setSearchValue}
            placeholder='Search...'
            className='w-full'
          />

          {/* Category filter */}
          <CustomFormField
            type='select'
            name='category-filter'
            label='Category'
            placeholder='All'
            value={filterOptions.category_id || 'all'}
            onChange={v => handleCategoryChange(v as string)}
            selectOptions={[
              { label: 'All', value: 'all' },
              ...productCategories.map(cat => ({ label: cat.name, value: cat.id }))
            ]}
          />

          {/* SKU filter */}
          <CustomFormField
            type='text'
            name='sku-filter'
            label='SKU'
            placeholder='SKU...'
            value={filterOptions.sku || ''}
            onChange={value => {
              setFilterOptions((prev: any) => {
                const newOptions = { ...prev }

                if (value && typeof value === 'string' && value.trim() !== '') {
                  newOptions.sku = value
                } else {
                  delete newOptions.sku
                }

                // Optionally reset page on filter change
                if (newOptions.page) delete newOptions.page

                return newOptions
              })
            }}
          />
        </div>
        {hasActiveFilters() && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleClearFilters}
            className='text-gray hover:text-light mt-5 h-7'
          >
            Clear
          </Button>
        )}
      </div>
      {canCreateProduct && !hideActionButton && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 mt-5 h-7'
          onClick={handleOpenCreateModal}
        >
          <PlusIcon className='w-4 h-4' />
          <span className='hidden sm:block'>Add Non-Inventory Product</span>
        </Button>
      )}
    </div>
  )

  return (
    <>
      {hideTitle ? (
        <div className='p-6'>
          <CommonTable
            data={{
              data: (apiResponse?.data as Product[]) || [],
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
            emptyMessage='No non-inventory product found'
          />
        </div>
      ) : (
        <CommonLayout title='Non-Inventory Products' noTabs={true}>
          <CommonTable
            data={{
              data: (apiResponse?.data as Product[]) || [],
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
            emptyMessage='No non-inventory product found'
          />
        </CommonLayout>
      )}
      <CreateEditViewNonInventoryProductModal
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={handleSuccess}
        productId={selectedProductId || undefined}
        productDetails={selectedProduct || undefined}
        productCategories={productCategories}
        uomUnits={uomUnits}
        serviceTypes={serviceTypes}
        vendors={vendors}
      />
    </>
  )
}

export default NonInventoryProducts
