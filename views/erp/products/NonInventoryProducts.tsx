'use client'

import React, { useState, useEffect, useMemo } from 'react'
import debounce from '@/utils/debounce'

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
import { getInitialFilters, updateURL } from '@/utils/utility'
import ThreeDotButton from '@/components/erp/common/buttons/ThreeDotButton'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import CreateEditViewNonInventoryProductModal from './CreateEditViewNonInventoryProductModal'
import ViewButton from '@/components/erp/common/buttons/ViewButton'
import DuplicateButton from '@/components/erp/common/buttons/DuplicateButton'
import { Checkbox } from '@/components/ui/checkbox'
import { ExcelIcon } from '@/public/icons'
import { hasPermission } from '@/utils/role-permission'
import TableSearch from '@/components/erp/common/TableSearch'
import BulkEditProductModal from './BulkEditProductModal'
import BulkUpdateProductModal from './BulkUpdateProductModal'
import BulkQrPrintModal from './BulkQrPrintModal'
import CustomFormField from '@/components/form/CustomFormField'
import { formatCurrency } from '@/utils/currency'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'

const NonInventoryProducts: React.FC<ProductsProps> = ({
  productCategories,
  uomUnits,
  serviceTypes,
  vendors,
  isFromModal = false,
  selectedRows,
  setSelectedRows,
  hideTitle = false,
  hideActionButton = false,
  initialData,
  permissions
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse<Product> | null>(initialData || null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchValue, setSearchValue] = useState<string>('')
  const [skuValue, setSkuValue] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState<boolean>(false)
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState<boolean>(false)
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState<boolean>(false)
  const [isBulkQrModalOpen, setIsBulkQrModalOpen] = useState<boolean>(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const filterOptions = useMemo(() => {
    return getInitialFilters(searchParams)
  }, [searchParams])

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

  const canCreateProduct = permissions?.canCreateProduct ?? false
  const canEditProduct = permissions?.canEditProduct ?? false
  const canDeleteProduct = permissions?.canDeleteProduct ?? false
  const canViewProduct = permissions?.canViewProduct ?? false

  const [localSelectedRows, setLocalSelectedRows] = useState<Product[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const activeSelectedRows = isFromModal ? selectedRows : localSelectedRows
  const activeSetSelectedRows = isFromModal ? setSelectedRows : setLocalSelectedRows

  useEffect(() => {
    setApiResponse(initialData || null)
    setIsLoading(false)
  }, [initialData])

  // Set initial search value from filterOptions
  useEffect(() => {
    setSearchValue(filterOptions.search || '')
    setSkuValue(filterOptions.sku || '')
    if (!hideTitle) dispatch(setPageTitle('Manage Non-Inventory Products'))
  }, [])

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

  const debouncedSkuSearch = useMemo(
    () =>
      debounce((val: string) => {
        setFilterOptions((prev: any) => {
          const newOptions = { ...prev }

          if (val && val.trim() !== '') {
            newOptions.sku = val
          } else {
            delete newOptions.sku
          }

          if (newOptions.page) {
            delete newOptions.page
          }

          return newOptions
        })
      }, 500),
    []
  )

  const onSkuSearchChange = (value: string) => {
    setSkuValue(value)
    debouncedSkuSearch(value)
  }

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

  const handleOpenDuplicateModal = async (id: string) => {
    setModalMode('duplicate' as any)
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
    router.refresh()
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

  const handleExport = async () => {
    try {
      toast.info(`Exporting non-inventory products...`)
      const blob = await NonInventoryProductService.exportProducts(filterOptions)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')

      a.href = url
      const dateStr = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0]

      a.download = `non-inventory-products-export-${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(`Non-inventory products exported successfully`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await NonInventoryProductService.destroy(id)
        .then(() => {
          toast.success('Non-inventory product deleted successfully')
          activeSetSelectedRows?.((prev: any) => (prev || []).filter((r: any) => r.id !== id))

          const total = apiResponse?.total || 0
          const perPage = apiResponse?.per_page || 10
          const currentPage = filterOptions.page ? Number(filterOptions.page) : 1
          const restItemCount = total - 1
          const pageCount = Math.max(1, Math.ceil(restItemCount / perPage))

          if (currentPage > pageCount) {
            setFilterOptions((prev: any) => ({ ...prev, page: pageCount }))
          } else {
            router.refresh()
          }
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

  const handleBulkDelete = async () => {
    if (!activeSelectedRows || activeSelectedRows.length === 0) return
    setIsBulkDeleting(true)

    try {
      await NonInventoryProductService.bulkDelete({ ids: activeSelectedRows.map(r => r.id) })
      toast.success('Non-inventory products deleted successfully')

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
        router.refresh()
      }
    } catch (error: any) {
      toast.error(typeof error.message === 'string' ? error.message : 'Failed to delete non-inventory products')
    } finally {
      setIsBulkDeleting(false)
    }
  }

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
      id: 'product_cost',
      header: 'Unit Cost',
      cell: (row: Product) => (
        <span>
          {formatCurrency(Number(row?.product_cost || '0'))}/{row?.selling_unit?.name}
        </span>
      ),
      sortable: true
    },
    {
      id: 'selling_price',
      header: 'Selling Price',
      cell: (row: Product) => <span>{formatCurrency(Number(row?.selling_price || '0'))}</span>,
      sortable: true
    },
    {
      id: 'coverage_per_rate',
      header: 'Coverage per Rate',
      cell: (row: Product) => (
        <span>
          {row.coverage_per_rate} {row.coverage_unit?.name ?? ''} / {row.purchase_unit?.name ?? ''}
        </span>
      ),
      sortable: false
    },
    {
      id: 'from_b2b',
      header: 'From B2B',
      cell: (row: Product) => <span>{row.vendor?.userable?.is_enable_b2b ? 'Yes' : 'No'}</span>,
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
    <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between w-full gap-2.5'>
      <div className='flex-1 flex flex-col lg:flex-row lg:items-start gap-2'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-2 w-full lg:max-w-240'>
          {/* Global search filter */}
          <TableSearch
            name='product-search'
            label='Search'
            value={searchValue}
            onChange={onSearchChange}
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
            value={skuValue}
            onChange={value => onSkuSearchChange(value as string)}
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
        <Button
          variant='default'
          size='sm'
          className='h-7 bg-light text-bg hover:bg-light/90 gap-1.5'
          onClick={handleExport}
        >
          <ExcelIcon className='w-4 h-4' />
          <span className='hidden min-[480px]:block'>Export</span>
        </Button>
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
            <span className='hidden sm:block'>Add Non-Inventory Product</span>
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
      <ConfirmDialog
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title='Confirm Bulk Delete'
        message={`Are you sure you want to delete ${activeSelectedRows?.length || 0} non-inventory products? This action cannot be undone.`}
        confirmButtonTitle='Delete'
        confirmButtonProps={{ variant: 'destructive' }}
        onConfirm={handleBulkDelete}
        loading={isBulkDeleting}
      />
      <BulkEditProductModal
        open={isBulkEditModalOpen}
        onOpenChange={setIsBulkEditModalOpen}
        onSuccess={() => {
          router.refresh()
          activeSetSelectedRows?.([])
        }}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='non_inventory'
      />
      <BulkUpdateProductModal
        open={isBulkUpdateModalOpen}
        onOpenChange={setIsBulkUpdateModalOpen}
        onSuccess={() => {
          router.refresh()
          activeSetSelectedRows?.([])
        }}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='non_inventory'
        vendorId={filterOptions.vendor_id && filterOptions.vendor_id !== 'all' ? filterOptions.vendor_id : null}
        categoryId={filterOptions.category_id && filterOptions.category_id !== 'all' ? filterOptions.category_id : null}
      />
      <BulkQrPrintModal
        open={isBulkQrModalOpen}
        onOpenChange={setIsBulkQrModalOpen}
        selectedIds={activeSelectedRows ? activeSelectedRows.map(r => r.id) : []}
        type='non_inventory'
      />
    </>
  )
}

export default NonInventoryProducts
