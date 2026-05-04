'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon, Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, ProductsProps } from '@/types'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
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
      cell: (row: Product) => <span className='font-medium'>{row?.vendor?.first_name ?? ''}</span>,
      sortable: true
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row: Product) => <span className='font-medium'>{row?.category?.name ?? ''}</span>,
      sortable: true
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: (row: Product) => <span className='font-medium'>{row.sku}</span>,
      sortable: true
    },
    {
      id: 'product_name',
      header: 'Product Name',
      cell: (row: Product) => (
        <span className='font-medium'>{row.vendor_product_name || row.private_product_name}</span>
      ),
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: Product) => <span className='font-medium'>{row.description}</span>,
      sortable: true
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: Product) => <span className='font-medium'>{row.vendor_style || row.private_style}</span>,
      sortable: true
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: Product) => <span className='font-medium'>{row.vendor_color || row.private_color}</span>,
      sortable: true
    },
    {
      id: 'product_price',
      header: 'Product Price',
      cell: (row: Product) => (
        <span className='font-medium'>
          {Number(row?.selling_price ?? 0).toFixed(2)}/{row.selling_unit?.name}
        </span>
      ),
      sortable: false
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
    <div className='flex items-center justify-between w-full gap-2.5 '>
      <div className='flex items-center gap-2 lg:flex-0 flex-1'>
        <div className='flex flex-col flex-1'>
          <label htmlFor='product-search' className='text-xs font-medium mb-1 text-muted-foreground'>
            Search
          </label>
          <InputGroup>
            <InputGroupInput
              id='product-search'
              placeholder='Search...'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className='lg:w-80 min-w-0'
            />
            <InputGroupAddon className='hidden! sm:block!'>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className='flex flex-col flex-1'>
          <label htmlFor='category-filter' className='text-xs font-medium mb-1 text-muted-foreground'>
            Category
          </label>
          <Select value={filterOptions.category_id || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger id='category-filter' className='md:min-w-40 min-w-0 w-full'>
              <SelectValue placeholder='All' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All</SelectItem>
              {productCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col flex-1'>
          <label htmlFor='sku-filter' className='text-xs font-medium mb-1 text-muted-foreground'>
            SKU
          </label>
          <InputGroup>
            <InputGroupInput
              id='sku-filter'
              placeholder='SKU...'
              value={filterOptions.sku || ''}
              onChange={e => {
                const value = e.target.value

                setFilterOptions((prev: any) => {
                  const newOptions = { ...prev }

                  if (value && value.trim() !== '') {
                    newOptions.sku = value
                  } else {
                    delete newOptions.sku
                  }

                  if (newOptions.page) delete newOptions.page

                  return newOptions
                })
              }}
              className='lg:w-40 min-w-0'
            />
          </InputGroup>
        </div>
        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light mt-5'>
            Clear
          </Button>
        )}
      </div>
      {canCreateProduct && !hideActionButton && (
        <Button
          variant='default'
          size='sm'
          className='bg-light text-bg hover:bg-light/90 mt-5'
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
