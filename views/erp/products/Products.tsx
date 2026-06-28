'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { PlusIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, ProductsProps } from '@/types'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import DuplicateButton from '@/components/erp/common/buttons/DuplicateButton'
import { getInitialFilters, mathRoundFixed, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import ProductService from '@/services/api/products/products.service'
import CreateEditViewProductModal from './CreateEditViewProductModal'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import { Checkbox } from '@/components/ui/checkbox'
import { ExcelIcon } from '@/public/icons'
import { hasPermission } from '@/utils/role-permission'
import { formatCurrency } from '@/utils/currency'
import TableSearch from '@/components/erp/common/TableSearch'
import BulkEditProductModal from './BulkEditProductModal'
import BulkUpdateProductModal from './BulkUpdateProductModal'
import BulkQrPrintModal from './BulkQrPrintModal'
import CustomFormField from '@/components/form/CustomFormField'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

const Products: React.FC<ProductsProps> = ({
  productCategories,
  uomUnits,
  serviceTypes,
  vendors,
  isFromModal = false,
  selectedRows,
  setSelectedRows,
  selected_vendor_id = null,
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

  const [localSelectedRows, setLocalSelectedRows] = useState<Product[]>([])
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false)
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState<boolean>(false)
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState<boolean>(false)
  const [isBulkQrModalOpen, setIsBulkQrModalOpen] = useState<boolean>(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const activeSelectedRows = isFromModal ? selectedRows : localSelectedRows
  const activeSetSelectedRows = isFromModal ? setSelectedRows : setLocalSelectedRows

  // Set initial search value from filterOptions and check permissions
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
      ProductService.index({ ...filterOptions, ...(selected_vendor_id ? { vendor_id: selected_vendor_id } : {}) })
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

    // show the page title only if not from modal
    if (!isFromModal) dispatch(setPageTitle('Manage Products'))
  }, [filterOptions, selected_vendor_id])

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

  const handleOpenDuplicateModal = async (id: string) => {
    setModalMode('duplicate' as any)
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

  /**
   * Handles the change of vendor filter
   * @param value The value of the vendor filter
   */
  const handleVendorChange = (value: string) => {
    setFilterOptions((prev: any) => {
      const newOptions = { ...prev }

      if (value === 'all') {
        delete newOptions.vendor_id
      } else {
        newOptions.vendor_id = value
      }

      return newOptions
    })
  }

  /**
   * Handles the change of category filter
   * @param value The value of the category filter
   */
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

  /**
   * Column definitions for CommonTable
   */
  const columns: Column[] = [
    {
      id: 'select',
      header: (
        <Checkbox
          className='border-accent-foreground/60!'
          checked={
            !!apiResponse?.data?.length &&
            (apiResponse.data as Product[]).every(row => activeSelectedRows?.some(r => r.id === row.id))
          }
          onCheckedChange={checked => {
            if (checked) {
              const newSelected = [...(activeSelectedRows || [])]
              const currentData = (apiResponse?.data || []) as Product[]

              currentData.forEach(row => {
                if (!newSelected.some(r => r.id === row.id)) {
                  newSelected.push(row)
                }
              })
              activeSetSelectedRows?.(newSelected)
            } else {
              const currentIds = ((apiResponse?.data as Product[]) || []).map(r => r.id)

              activeSetSelectedRows?.((activeSelectedRows || []).filter(r => !currentIds.includes(r.id)))
            }
          }}
        />
      ),
      cell: (row: Product) => (
        <Checkbox
          checked={activeSelectedRows?.some((r: Product) => r.id === row.id)}
          onCheckedChange={checked => {
            activeSetSelectedRows?.((prev: any) => {
              const prevArray = prev || []

              if (checked) {
                if (!prevArray.some((r: Product) => r.id === row.id)) return [...prevArray, row]

                return prevArray
              } else {
                return prevArray.filter((r: Product) => r.id !== row.id)
              }
            })
          }}
        />
      ),
      sortable: false,
      size: 16
    },
    ...(!isFromModal
      ? [
          {
            id: 'index',
            header: '#',
            cell: (row: Product, rowIndex: number | undefined) => {
              // Calculate the absolute index based on pagination
              const from = apiResponse?.from || 1

              return <span className='text-gray'>{from + (rowIndex || 0)}</span>
            },
            sortable: false,
            size: 16
          } as Column
        ]
      : []),

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
      id: 'coverage',
      header: 'Coverage',
      cell: (row: Product) => (
        <span>
          {row.available_stock && row.coverage_per_rate && (
            <>
              {mathRoundFixed((row.available_stock ?? 0) * (row.coverage_per_rate ?? 0))} (
              {row.coverage_unit?.name ?? row.purchase_unit?.name ?? ''})
            </>
          )}
        </span>
      ),
      sortable: false
    },
    {
      id: 'selling_price',
      header: 'Customer Price',
      cell: (row: Product) => (
        <span>
          {row?.selling_price != null ? formatCurrency(row.selling_price) : '—'}/{row.selling_unit?.name}
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
                      ...(canCreateProduct
                        ? [
                            <DuplicateButton
                              tooltip='Duplicate Product'
                              onClick={() => handleOpenDuplicateModal(row.id)}
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
                        : []),
                      <Button
                        variant='ghost'
                        onClick={() =>
                          router.push(
                            `/erp/products/stock?tab=inventory&inventory_product_id=${encodeURIComponent(row.id)}`
                          )
                        }
                        className='w-full'
                      >
                        Show Inventory
                      </Button>
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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const handleBulkDelete = async () => {
    if (!activeSelectedRows || activeSelectedRows.length === 0) return
    setIsBulkDeleting(true)

    try {
      await ProductService.bulkDelete({ ids: activeSelectedRows.map(r => r.id) })
      toast.success('Products deleted successfully')

      const total = apiResponse?.total || 0
      const perPage = apiResponse?.per_page || 10
      const currentPage = filterOptions.page ? Number(filterOptions.page) : 1
      const restItemCount = total - activeSelectedRows.length
      const pageCount = Math.max(1, Math.ceil(restItemCount / perPage))

      activeSetSelectedRows?.([])
      setIsBulkDeleteModalOpen(false)

      if (currentPage > pageCount) {
        setFilterOptions((prev: any) => ({ ...prev, page: pageCount }))
      } else {
        fetchData()
      }
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete products')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleExport = async () => {
    try {
      toast.info(`Exporting products...`)
      const blob = await ProductService.exportProducts(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `products-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Products exported successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await ProductService.destroy(id)
        .then(response => {
          toast.success('Product deleted successfully')
          activeSetSelectedRows?.((prev: any) => (prev || []).filter((r: any) => r.id !== id))

          const total = apiResponse?.total || 0
          const perPage = apiResponse?.per_page || 10
          const currentPage = filterOptions.page ? Number(filterOptions.page) : 1
          const restItemCount = total - 1
          const pageCount = Math.max(1, Math.ceil(restItemCount / perPage))

          if (currentPage > pageCount) {
            setFilterOptions((prev: any) => ({ ...prev, page: pageCount }))
          } else {
            fetchData()
          }
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
    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between w-full gap-2.5'>
      <div className='flex-1 flex flex-col lg:flex-row lg:items-start gap-2'>
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
          {/* Vendor filter */}
          <CustomFormField
            type='select'
            name='vendor-filter'
            label='Vendor'
            placeholder='All'
            value={filterOptions.vendor_id || 'all'}
            onChange={v => handleVendorChange(v as string)}
            selectOptions={[
              { label: 'All', value: 'all' },
              ...(vendors || []).map(v => ({ label: `${v.first_name} ${v.last_name ?? ''}`, value: v.id }))
            ]}
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
            className='text-gray hover:text-light lg:mt-5.75 h-7'
          >
            Clear
          </Button>
        )}
      </div>
      <div className='flex items-start flex-wrap gap-2 lg:mt-5.75'>
        {!isFromModal && <Button
          variant='default'
          size='sm'
          className='h-7 bg-light text-bg hover:bg-light/90 gap-1.5'
          onClick={handleExport}
        >
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>}
        {!isFromModal && activeSelectedRows && activeSelectedRows.length > 0 && canEditProduct && (
          <Button
            variant='outline'
            size='sm'
            className='h-7 bg-[#2A2A2A] hover:bg-[#333333]'
            onClick={() => setIsBulkEditModalOpen(true)}
          >
            Bulk Edit
          </Button>
        )}
        {!isFromModal && activeSelectedRows && activeSelectedRows.length > 0 && canEditProduct && (
          <Button
            variant='outline'
            size='sm'
            className='h-7 bg-[#2A2A2A] hover:bg-[#333333]'
            onClick={() => setIsBulkUpdateModalOpen(true)}
          >
            Bulk Update
          </Button>
        )}
        {!isFromModal && activeSelectedRows && activeSelectedRows.length > 0 && canEditProduct && (
          <Button
            variant='outline'
            size='sm'
            className='h-7 bg-[#2A2A2A] hover:bg-[#333333]'
            onClick={() => setIsBulkQrModalOpen(true)}
          >
            Bulk QR
          </Button>
        )}
        {!isFromModal && activeSelectedRows && activeSelectedRows.length > 0 && canDeleteProduct && (
          <Button variant='destructive' size='sm' className='h-7' onClick={() => setIsBulkDeleteModalOpen(true)}>
            Bulk Delete
          </Button>
        )}
        {canCreateProduct && !hideActionButton && (
          <Button
            variant='default'
            size='sm'
            className='bg-light text-bg hover:bg-light/90 h-7'
            onClick={handleOpenCreateModal}
          >
            <PlusIcon className='w-4 h-4' />
            <span>Add Product</span>
          </Button>
        )}
      </div>
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
            emptyMessage='No product found'
          />
        </div>
      ) : (
        <CommonLayout title='Products' noTabs={true}>
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
            emptyMessage='No product found'
          />
        </CommonLayout>
      )}
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
      <ConfirmDialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title='Confirm Bulk Delete'
        message={`Are you sure you want to delete ${activeSelectedRows?.length || 0} products? This action cannot be undone.`}
        confirmButtonTitle='Delete'
        confirmButtonProps={{ variant: 'destructive' }}
        onConfirm={handleBulkDelete}
        loading={isBulkDeleting}
      />
      <BulkEditProductModal
        open={isBulkEditModalOpen}
        onOpenChange={setIsBulkEditModalOpen}
        onSuccess={() => {
          fetchData()
          activeSetSelectedRows?.([])
        }}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='inventory'
      />
      <BulkUpdateProductModal
        open={isBulkUpdateModalOpen}
        onOpenChange={setIsBulkUpdateModalOpen}
        onSuccess={() => {
          fetchData()
          activeSetSelectedRows?.([])
        }}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='inventory'
        vendorId={filterOptions.vendor_id && filterOptions.vendor_id !== 'all' ? filterOptions.vendor_id : null}
        categoryId={filterOptions.category_id && filterOptions.category_id !== 'all' ? filterOptions.category_id : null}
      />
      <BulkQrPrintModal
        open={isBulkQrModalOpen}
        onOpenChange={setIsBulkQrModalOpen}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='inventory'
      />
    </>
  )
}

export default Products
