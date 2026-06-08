'use client'

import React, { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { ShoppingCartIcon } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, ProductsProps, PurchaseOrder } from '@/types'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { getInitialFilters, mathRoundFixed, updateURL } from '@/utils/utility'
import ProductService from '@/services/api/products/products.service'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { PackageIcon, WarehouseIcon, SlidersHorizontalIcon } from 'lucide-react'
import ProductInventorySection from './ProductInventorySection'
import InventoryAdjustmentSection from './InventoryAdjustmentSection'
import { formatCurrency } from '@/utils/currency'
import TableSearch from '@/components/erp/common/TableSearch'
import CustomFormField from '@/components/form/CustomFormField'

const ProductStock: React.FC<ProductsProps> = ({
  productCategories,
  uomUnits = [],
  vendors = [],
  serviceTypes = [],
  warehouses = [],
  businessLocations = []
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()

  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')

  const [filterOptions, setFilterOptions] = useState<any>(() => {
    const filters = getInitialFilters(searchParams)

    // These are navigation params, not API filters.
    delete filters.inventory_product_id
    delete filters.tab

    return filters
  })

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedInventory, setSelectedInventory] = useState<PurchaseOrder | null>(null)
  const [activeTab, setActiveTab] = useState<'stock' | 'inventory' | 'adjustment'>('stock')
  const hasProcessedInitialNavigation = useRef(false)

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

  useEffect(() => {
    if (hasProcessedInitialNavigation.current) {
      return
    }

    hasProcessedInitialNavigation.current = true

    const tab = searchParams.get('tab')
    const inventoryProductId = searchParams.get('inventory_product_id')

    if (tab === 'inventory' && inventoryProductId) {
      ProductService.show(inventoryProductId)
        .then(response => {
          setSelectedProduct(response.data)
          setSelectedInventory(null)
          setActiveTab('inventory')
        })
        .catch(error => {
          toast.error(typeof error?.message === 'string' ? error.message : 'Failed to fetch product details')
        })
    }
  }, [searchParams])

  const fetchData = async () => {
    setIsLoading(true)

    ProductService.index({ ...filterOptions, type: 'inventory' })
      .then(response => {
        setApiResponse(response.data)
        setIsLoading(false)
      })
      .catch(error => {
        setIsLoading(false)
        toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch products')
      })
  }

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchData()
    }

    updateURL(router, filterOptions)
    dispatch(setPageTitle('Inventory Product Stock'))
  }, [filterOptions, activeTab])

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

  const handleClearFilters = () => {
    setFilterOptions({})
    setSearchValue('')
  }

  const hasActiveFilters = () => {
    const filterKeys = Object.keys(filterOptions).filter(key => key !== 'page' && key !== 'per_page')

    return filterKeys.length > 0
  }

  const columns: Column[] = [
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
      id: 'product_name',
      header: 'Product Name',
      cell: (row: Product) => <span>{row.vendor_product_name || row.private_product_name}</span>,
      sortable: false
    },
    {
      id: 'description',
      header: 'Description',
      cell: (row: Product) => <span>{row.description}</span>,
      sortable: false
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: Product) => <span>{row.vendor_style || row.private_style}</span>,
      sortable: false
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: Product) => <span>{row.vendor_color || row.private_color}</span>,
      sortable: false
    },
    {
      id: 'uom',
      header: 'UOM',
      cell: (row: Product) => <span>{row.purchase_unit?.name ?? row.purchase_uom?.name ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'on_hand_stock',
      header: 'On Hand',
      cell: (row: Product) => <span>{mathRoundFixed(row.on_hand_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'allocated_stock',
      header: 'Allocated',
      cell: (row: Product) => <span>{mathRoundFixed(row.allocated_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'prepared_stock',
      header: 'Prepared',
      cell: (row: Product) => <span>{mathRoundFixed(row.prepared_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'available_stock',
      header: 'Available',
      cell: (row: Product) => <span>{mathRoundFixed(row.available_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'picked_up_stock',
      header: 'Picked Up',
      cell: (row: Product) => <span>{mathRoundFixed(row.picked_up_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'remaining_stock',
      header: 'Remaining Stock',
      cell: (row: Product) => {
        const purchaseUnitName = row.purchase_unit?.name ?? row.purchase_uom?.name ?? ''
        const coverageUnitName = row.coverage_unit?.name ?? row.coverage_uom?.name ?? ''

        const coverageQty =
          row.available_stock != null && row.coverage_per_rate != null
            ? mathRoundFixed(row.available_stock * row.coverage_per_rate)
            : null

        return (
          <div className='flex flex-col leading-tight'>
            <span>
              {row.available_stock != null ? mathRoundFixed(row.available_stock) : '0'}{' '}
              {purchaseUnitName && <span className='text-muted-foreground text-xs'>({purchaseUnitName})</span>}
            </span>
            {coverageQty != null && (
              <span className='text-xs text-muted-foreground'>
                {coverageQty} {coverageUnitName && `(${coverageUnitName})`}
              </span>
            )}
          </div>
        )
      },
      sortable: false
    },
    {
      id: 'product_cost',
      header: 'Company Cost',
      cell: (row: Product) => <span>{row.product_cost != null ? formatCurrency(row.product_cost) : '—'}</span>,
      sortable: true
    },
    {
      id: 'work_order_cost',
      header: 'Work Order Cost',
      cell: (row: Product) => (
        <span>
          {row.work_order_cost != null
            ? formatCurrency(row.work_order_cost)
            : row.product_cost != null
              ? formatCurrency(row.product_cost)
              : '—'}
        </span>
      ),
      sortable: true
    },
    {
      id: 'cost_uom',
      header: 'Cost UOM',
      cell: (row: Product) => <span>{row.purchase_unit?.name ?? row.purchase_uom?.name ?? '—'}</span>,
      sortable: false
    },
    {
      id: 'required_stock',
      header: 'Required',
      cell: (row: Product) => <span>{mathRoundFixed(row.required_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'shortage_stock',
      header: 'Shortage',
      cell: (row: Product) => <span>{mathRoundFixed(row.shortage_stock ?? 0)}</span>,
      sortable: true
    },
    {
      id: 'location_notes',
      header: 'Location Notes',
      cell: (row: Product) => <span>{row.location_notes ?? '—'}</span>,
      sortable: true
    },
    {
      id: 'action',
      header: 'Action',
      cell: (row: Product) => (
        <Button
          variant='ghost'
          size='icon'
          onClick={() =>
            router.push(
              `/erp/products/purchase-orders?open_po_modal=create&po_product_id=${encodeURIComponent(row.id)}`
            )
          }
        >
          <ShoppingCartIcon className='w-6 h-6' />
        </Button>
      ),
      sortable: false
    }
  ]

  const customFilters = (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2.5'>
      <div className='flex-1 flex flex-col md:flex-row md:items-center gap-2'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 w-full md:max-w-160'>
          <TableSearch
            name='stock-search'
            label='Search'
            value={searchValue}
            onChange={setSearchValue}
            placeholder='Search...'
            className='w-full lg:w-80 min-w-0'
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
    </div>
  )

  const tabs = [
    {
      label: 'Stock',
      icon: <PackageIcon className='w-4 h-4' />,
      onClick: () => {
        setActiveTab('stock')
        setSelectedInventory(null)
        setSelectedProduct(null)
      },
      isActive: activeTab === 'stock',
      disabled: false
    },
    {
      label: 'Inventory',
      icon: <WarehouseIcon className='w-4 h-4' />,
      onClick: () => {
        if (selectedProduct) {
          setSelectedInventory(null)
          setActiveTab('inventory')
        }
      },
      isActive: activeTab === 'inventory',
      disabled: !selectedProduct
    },
    {
      label: `Adjustment${selectedInventory ? ` (PO-${selectedInventory.purchase_order_number})` : ''}`,
      icon: <SlidersHorizontalIcon className='w-4 h-4' />,
      onClick: () => selectedInventory && setActiveTab('adjustment'),
      isActive: activeTab === 'adjustment',
      disabled: !selectedInventory
    }
  ]

  return (
    <CommonLayout title='Product Stock' buttons={tabs}>
      {activeTab === 'stock' && (
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
          emptyMessage='No products found'
          handleRowSelect={(row: Product) => {
            setSelectedProduct(row)
            setSelectedInventory(null)
          }}
        />
      )}

      {activeTab === 'inventory' && selectedProduct && (
        <ProductInventorySection
          product={selectedProduct}
          warehouses={warehouses}
          businessLocations={businessLocations}
          onInventorySelect={row => {
            setSelectedInventory(row)
          }}
        />
      )}

      {activeTab === 'adjustment' && selectedInventory && selectedProduct && (
        <InventoryAdjustmentSection inventory={selectedInventory} product={selectedProduct} />
      )}
    </CommonLayout>
  )
}

export default ProductStock
