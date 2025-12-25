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
import ProductService from '@/services/api/products/products.service'
import CreateEditViewProductModal from './CreateEditViewProductModal'
import ViewButton from '@/components/erp/common/buttons/ViewButton'

const Products: React.FC<ProductsProps> = ({ productCategories, uomUnits, serviceTypes, vendors }) => {
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

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
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
      ProductService.index(filterOptions)
        .then(response => {
          setApiResponse(response.data)
          setIsLoading(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch products')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Something went wrong while fetching products!')
    }
  }

  useEffect(() => {
    fetchData()
    updateURL(router, filterOptions)
    dispatch(setPageTitle('Manage Products'))
  }, [filterOptions])

  // Transform API data to match table format
  const productsData = apiResponse?.data
    ? apiResponse.data.map((product: Product, index: number) => {
        return {
          id: product.id,
          index: (apiResponse?.from || 1) + index,
          vendor: product?.vendor?.first_name ?? '',
          category: product?.category?.name || ' ',
          sku: product.sku,
          product_name: product.vendor_product_name || product.private_product_name,
          description: product.description,
          style: product.vendor_style || product.private_style,
          color: product.vendor_color || product.private_color,
          coverage: (product.coverage_per_uom?.value || '') + ' ' + (product.coverage_per_uom?.unit?.name || ' '),
          product_price: (product.selling_info?.value || '') + ' ' + (product.selling_info?.unit?.name || ' ')
        }
      })
    : []

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedProductId(null)
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (id: string) => {
    setModalMode('edit')
    setSelectedProductId(id)

    // Fetch partner type details
    try {
      const response = await ProductService.show(id)

      setSelectedProduct(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch product details')
    }
  }

  const handleOpenViewModal = async (id: string) => {
    setModalMode('view')
    setSelectedProductId(id)

    try {
      const response = await ProductService.show(id)

      setSelectedProduct(response.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Failed to fetch product details')
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
      id: 'vendor',
      header: 'Vendor',
      cell: row => <span className='font-medium'>{row.vendor}</span>,
      sortable: true
    },
    {
      id: 'category',
      header: 'Category',
      cell: row => <span className='font-medium'>{row.category}</span>,
      sortable: true
    },
    {
      id: 'sku',
      header: 'SKU',
      cell: row => <span className='font-medium'>{row.sku}</span>,
      sortable: true
    },
    {
      id: 'product_name',
      header: 'Product Name',
      cell: row => <span className='font-medium'>{row.product_name}</span>,
      sortable: true
    },
    {
      id: 'description',
      header: 'Description',
      cell: row => <span className='font-medium'>{row.description}</span>,
      sortable: true
    },
    {
      id: 'style',
      header: 'Style',
      cell: row => <span className='font-medium'>{row.style}</span>,
      sortable: true
    },
    {
      id: 'color',
      header: 'Color',
      cell: row => <span className='font-medium'>{row.color}</span>,
      sortable: true
    },
    {
      id: 'coverage',
      header: 'Coverage',
      cell: row => <span className='font-medium'>{row.coverage}</span>,
      sortable: false
    },
    {
      id: 'product_price',
      header: 'Product Price',
      cell: row => <span className='font-medium'>{row.product_price}</span>,
      sortable: false
    },
    {
      id: 'actions',
      header: 'Action',
      cell: row => (
        <div className='flex items-center justify-center gap-2'>
          <ThreeDotButton
            buttons={[
              <ViewButton
                tooltip='View Product Information'
                onClick={() => handleOpenViewModal(row.id)}
                variant='text'
              />,
              <EditButton
                tooltip='Edit Product Information'
                onClick={() => handleOpenEditModal(row.id)}
                variant='text'
              />,
              <DeleteButton tooltip='Delete Product' variant='text' onClick={() => handleDeleteProduct(row.id)} />
            ]}
          />
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

  const handleDeleteProduct = async (id: string) => {
    try {
      ProductService.destroy(id)
        .then(response => {
          toast.success('Product deleted successfully')
          fetchData()
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete product')
        })
    } catch (error) {
      toast.error('Something went wrong while deleting the product!')
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
      <Button
        variant='default'
        size='sm'
        className='bg-light text-bg hover:bg-light/90'
        onClick={handleOpenCreateModal}
      >
        <PlusIcon className='w-4 h-4' />
        Add Product
      </Button>
    </div>
  )

  return (
    <>
      <CommonLayout title='Products' noTabs={true}>
        <CommonTable
          data={{
            data: productsData,
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
          emptyMessage='No product found'
        />
      </CommonLayout>

      <CreateEditViewProductModal
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

export default Products
