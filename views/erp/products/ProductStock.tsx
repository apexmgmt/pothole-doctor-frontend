'use client'

import React, { useState, useEffect } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { Search } from 'lucide-react'

import { toast } from 'sonner'

import CommonLayout from '@/components/erp/dashboard/crm/CommonLayout'
import CommonTable from '@/components/erp/common/table'
import { Button } from '@/components/ui/button'
import { Column, DataTableApiResponse, Product, ProductsProps } from '@/types'
import { PurchaseOrder } from '@/types/purchase_orders'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'
import { getInitialFilters, updateURL } from '@/utils/utility'
import ProductService from '@/services/api/products/products.service'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { PackageIcon, WarehouseIcon, SlidersHorizontalIcon } from 'lucide-react'
import ProductInventorySection from './ProductInventorySection'
import InventoryAdjustmentSection from './InventoryAdjustmentSection'

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
  const [filterOptions, setFilterOptions] = useState<any>(getInitialFilters(searchParams))
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedInventory, setSelectedInventory] = useState<PurchaseOrder | null>(null)
  const [activeTab, setActiveTab] = useState<'stock' | 'inventory' | 'adjustment'>('stock')

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
      sortable: false
    },
    {
      id: 'style',
      header: 'Style',
      cell: (row: Product) => <span className='font-medium'>{row.vendor_style || row.private_style}</span>,
      sortable: false
    },
    {
      id: 'color',
      header: 'Color',
      cell: (row: Product) => <span className='font-medium'>{row.vendor_color || row.private_color}</span>,
      sortable: false
    },
    {
      id: 'uom',
      header: 'UOM',
      cell: (row: Product) => (
        <span className='font-medium'>{row.purchase_unit?.name ?? row.purchase_uom?.name ?? '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'on_hand_stock',
      header: 'On Hand',
      cell: (row: Product) => <span className='font-medium'>{row.on_hand_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'allocated_stock',
      header: 'Allocated',
      cell: (row: Product) => <span className='font-medium'>{row.allocated_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'prepared_stock',
      header: 'Prepared',
      cell: (row: Product) => <span className='font-medium'>{row.prepared_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'available_stock',
      header: 'Available',
      cell: (row: Product) => <span className='font-medium'>{row.available_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'picked_up_stock',
      header: 'Picked Up',
      cell: (row: Product) => <span className='font-medium'>{row.picked_up_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'remaining_stock',
      header: 'Remaining Stock',
      cell: (row: Product) => {
        const purchaseUnitName = row.purchase_unit?.name ?? row.purchase_uom?.name ?? ''
        const coverageUnitName = row.coverage_unit?.name ?? row.coverage_uom?.name ?? ''

        const coverageQty =
          row.available_stock != null && row.coverage_per_rate != null
            ? Number((row.available_stock * row.coverage_per_rate).toFixed(2))
            : null

        return (
          <div className='flex flex-col leading-tight'>
            <span className='font-medium'>
              {row.remaining_stock != null ? Number(row.remaining_stock).toFixed(2) : '0.00'}{' '}
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
      id: 'company_cost',
      header: 'Company Cost',
      cell: (row: Product) => (
        <span className='font-medium'>{row.product_cost != null ? Number(row.product_cost).toFixed(2) : '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'work_order_cost',
      header: 'Work Order Cost',
      cell: (row: Product) => (
        <span className='font-medium'>
          {row.work_order_cost != null
            ? Number(row.work_order_cost).toFixed(2)
            : row.product_cost != null
              ? Number(row.product_cost).toFixed(2)
              : '—'}
        </span>
      ),
      sortable: false
    },
    {
      id: 'cost_uom',
      header: 'Cost UOM',
      cell: (row: Product) => (
        <span className='font-medium'>{row.purchase_unit?.name ?? row.purchase_uom?.name ?? '—'}</span>
      ),
      sortable: false
    },
    {
      id: 'required_stock',
      header: 'Required',
      cell: (row: Product) => <span className='font-medium'>{row.required_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'shortage_stock',
      header: 'Shortage',
      cell: (row: Product) => <span className='font-medium'>{row.shortage_stock ?? 0}</span>,
      sortable: false
    },
    {
      id: 'location_notes',
      header: 'Location Notes',
      cell: (row: Product) => <span className='font-medium'>{row.location_notes ?? '—'}</span>,
      sortable: false
    }
  ]

  const customFilters = (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-2'>
        <div className='flex flex-col'>
          <label htmlFor='stock-search' className='text-xs font-medium mb-1 text-muted-foreground'>
            Search
          </label>
          <InputGroup>
            <InputGroupInput
              id='stock-search'
              placeholder='Search...'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className='w-80'
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className='flex flex-col'>
          <label htmlFor='stock-category' className='text-xs font-medium mb-1 text-muted-foreground'>
            Category
          </label>
          <Select value={filterOptions.category_id || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger id='stock-category' className='w-40'>
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

        {hasActiveFilters() && (
          <Button variant='outline' size='sm' onClick={handleClearFilters} className='text-gray hover:text-light mt-5'>
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
