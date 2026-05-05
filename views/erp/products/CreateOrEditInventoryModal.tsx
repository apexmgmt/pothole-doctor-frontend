'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Product } from '@/types'
import { InventoryPayload, PurchaseOrder } from '@/types/products/purchase_orders'
import { Warehouse, BusinessLocation } from '@/types'
import InventoryService from '@/services/api/products/inventories.service'
import { getCostPrice, getMargin, getSellPrice } from '@/utils/business-calculation'

interface FormValues {
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  stock_area: string
  stock_section_id: string
  quantity: number
  company_cost: number
  work_order_cost: number
  margin: number | string
  customer_price: number | string
  regular_price: number | string
  regular_price_unit_id: string
  pallet_price: number | string
  pallet_price_unit_id: string
  comments: string
  dye_lot: string
}

interface CreateOrEditInventoryModalProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  product: Product
  inventoryDetails?: PurchaseOrder | null
  warehouses?: Warehouse[]
  businessLocations?: BusinessLocation[]
}

const CreateOrEditInventoryModal = ({
  mode,
  open,
  onOpenChange,
  onSuccess,
  product,
  inventoryDetails,
  warehouses = [],
  businessLocations = []
}: CreateOrEditInventoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const purchaseProduct = inventoryDetails?.purchase_products?.[0]

  const defaultMargin = product.margin ?? ''
  const defaultCustomerPrice = product.selling_price ?? ''
  const defaultWorkOrderCost = product.work_order_cost ?? product.product_cost ?? 0

  const form = useForm<FormValues>({
    defaultValues: {
      warehouse_type: 'warehouse',
      warehouse_id: '',
      stock_area: '',
      stock_section_id: '',
      quantity: 0,
      company_cost: product.product_cost ?? 0,
      work_order_cost: defaultWorkOrderCost,
      margin: defaultMargin,
      customer_price: getSellPrice(Number(defaultWorkOrderCost), Number(defaultMargin)),
      regular_price: '',
      regular_price_unit_id: '',
      pallet_price: '',
      pallet_price_unit_id: '',
      comments: '',
      dye_lot: ''
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        warehouse_type: (inventoryDetails?.warehouse_type as 'warehouse' | 'location') || 'warehouse',
        warehouse_id: inventoryDetails?.warehouse_id || '',
        stock_area: purchaseProduct?.purchase_product_receipts?.[0]?.stock_area || '',
        stock_section_id: purchaseProduct?.purchase_product_receipts?.[0]?.stock_section_id || '',
        quantity: purchaseProduct?.quantity ?? 0,
        company_cost: product.product_cost ?? 0,
        work_order_cost: purchaseProduct?.work_order_cost ?? product.work_order_cost ?? product.product_cost ?? 0,
        margin: purchaseProduct?.margin ?? defaultMargin,
        customer_price:
          purchaseProduct?.customer_price ??
          getSellPrice(
            Number(purchaseProduct?.work_order_cost ?? product.work_order_cost ?? product.product_cost ?? 0),
            Number(purchaseProduct?.margin ?? defaultMargin)
          ),
        regular_price: purchaseProduct?.regular_price ?? '',
        regular_price_unit_id: purchaseProduct?.regular_price_unit_id ?? '',
        pallet_price: purchaseProduct?.pallet_price ?? '',
        pallet_price_unit_id: purchaseProduct?.pallet_price_unit_id ?? '',
        comments: inventoryDetails?.comments || '',
        dye_lot: purchaseProduct?.purchase_product_receipts?.[0]?.dye_lot || ''
      })
    }
  }, [open, inventoryDetails])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: InventoryPayload = {
      product_id: product.id,
      vendor_id: product.vendor_id,
      company_cost: Number(values.company_cost),
      warehouse_type: values.warehouse_type,
      warehouse_id: values.warehouse_id || null,
      stock_area: values.stock_area || null,
      stock_section_id: values.stock_section_id || null,
      quantity: Number(values.quantity),
      work_order_cost: Number(values.work_order_cost),
      margin: values.margin !== '' ? Number(values.margin) : null,
      customer_price: values.customer_price !== '' ? Number(values.customer_price) : null,
      regular_price: values.regular_price !== '' ? Number(values.regular_price) : null,
      regular_price_unit_id: values.regular_price_unit_id || null,
      pallet_price: values.pallet_price !== '' ? Number(values.pallet_price) : null,
      pallet_price_unit_id: values.pallet_price_unit_id || null,
      comments: values.comments || null,
      dye_lot: values.dye_lot || null
    }

    try {
      if (mode === 'create') {
        await InventoryService.store(payload)
        toast.success('Inventory created successfully')
      } else if (mode === 'edit' && inventoryDetails?.id) {
        await InventoryService.update(inventoryDetails.id, payload)
        toast.success('Inventory updated successfully')
      }

      onOpenChange(false)
      onSuccess()
      form.reset()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.map((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    onOpenChange(false)
    form.reset()
  }

  const displayField = (label: string, value: string | number | null | undefined) => (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium rounded-md px-3 py-2 bg-white/5 min-h-9'>{value ?? '—'}</span>
    </div>
  )

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add New Inventory' : 'Edit Inventory'}
      description=''
      maxWidth='5xl'
      isLoading={isLoading}
      loadingMessage={mode === 'create' ? 'Creating inventory...' : 'Updating inventory...'}
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' form='inventory-form' disabled={isLoading}>
            {isLoading ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Save' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='inventory-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Product Information */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-x-8 gap-y-3'>
                <div className='grid grid-cols-2 gap-4'>
                  {displayField('Vendor', product.vendor?.first_name)}
                  {displayField('Category', product.category?.name)}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {displayField('SKU', product.sku)}
                  {displayField('Size/Description', product.description)}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {displayField('Vendor Product Name', product.vendor_product_name)}
                  {displayField('Private Product Name', product.private_product_name)}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {displayField('Vendor Style', product.vendor_style)}
                  {displayField('Private Style', product.private_style)}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {displayField('Vendor Color', product.vendor_color)}
                  {displayField('Private Color', product.private_color)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className='grid grid-cols-2 gap-6'>
            {/* UOM / Coverage Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle>UOM/Coverage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='quantity'
                    rules={{ required: 'Quantity is required', min: { value: 0, message: 'Must be ≥ 0' } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Quantity <span className='text-destructive'>*</span>
                        </FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl>
                            <Input
                              type='number'
                              step='any'
                              min={0}
                              {...field}
                              onChange={e => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <span className='text-sm text-muted-foreground whitespace-nowrap'>
                            {product.purchase_unit?.name ?? product.purchase_uom?.name ?? 'Each'}
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {displayField(
                    'Coverage per UOM',
                    product.coverage_per_rate != null
                      ? `${product.coverage_per_rate} (${product.coverage_unit?.name ?? product.coverage_uom?.name ?? 'Each'})`
                      : '—'
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Cost / Pricing */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle>Product Cost/Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <FormField
                    control={form.control}
                    name='company_cost'
                    rules={{ required: 'Company Cost is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Company Cost <span className='text-destructive'>*</span>
                        </FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl>
                            <Input
                              type='number'
                              step='any'
                              min={0}
                              {...field}
                              onChange={e => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <span className='text-sm text-muted-foreground whitespace-nowrap'>
                            {product.purchase_unit?.name ?? product.purchase_uom?.name ?? ''}
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='work_order_cost'
                    rules={{ required: 'Work Order Cost is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Work Order Cost <span className='text-destructive'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='any'
                            min={0}
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                            onBlur={() => {
                              field.onBlur()
                              const newWoCost = Number(form.getValues('work_order_cost'))
                              const margin = Number(form.getValues('margin'))

                              form.setValue('customer_price', getSellPrice(newWoCost, margin))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='margin'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Margin (%)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='any'
                            placeholder='0.00'
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                            onBlur={() => {
                              field.onBlur()
                              const newMargin = Number(form.getValues('margin'))
                              const woCost = Number(form.getValues('work_order_cost'))

                              form.setValue('customer_price', getSellPrice(woCost, newMargin))
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='customer_price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Price</FormLabel>
                        <div className='flex items-center gap-2'>
                          <FormControl>
                            <Input
                              type='number'
                              step='any'
                              placeholder='0.00'
                              {...field}
                              onChange={e => field.onChange(e.target.value)}
                              onBlur={() => {
                                field.onBlur()
                                const newSellPrice = Number(form.getValues('customer_price'))
                                const woCost = Number(form.getValues('work_order_cost'))

                                form.setValue('margin', getMargin(woCost, newSellPrice))
                              }}
                            />
                          </FormControl>
                          <span className='text-sm text-muted-foreground whitespace-nowrap'>
                            {product.selling_unit?.name ?? product.selling_uom?.name ?? ''}
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Order Information */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle>Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
                {/* Left column */}
                <div className='space-y-4'>
                  {mode === 'edit' &&
                    displayField(
                      'PO#',
                      inventoryDetails?.purchase_order_number != null
                        ? `PO-${inventoryDetails.purchase_order_number}`
                        : '—'
                    )}

                  <FormField
                    control={form.control}
                    name='warehouse_type'
                    rules={{ required: 'Warehouse type is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Warehouse Type <span className='text-destructive'>*</span>
                        </FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={val => {
                            field.onChange(val)
                            form.setValue('warehouse_id', '')
                          }}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='warehouse'>Warehouse</SelectItem>
                            <SelectItem value='location'>Location</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='warehouse_id'
                    render={({ field }) => {
                      const warehouseType = form.watch('warehouse_type')
                      const isLocation = warehouseType === 'location'

                      return (
                        <FormItem>
                          <FormLabel>{isLocation ? 'Location' : 'Warehouse'}</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={val => {
                              field.onChange(val)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder={isLocation ? 'Select location' : 'Select warehouse'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLocation
                                ? businessLocations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id}>
                                      {loc.name}
                                    </SelectItem>
                                  ))
                                : warehouses.map(w => (
                                    <SelectItem key={w.id} value={w.id}>
                                      {w.title}
                                    </SelectItem>
                                  ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <FormField
                    control={form.control}
                    name='stock_area'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Area</FormLabel>
                        <FormControl>
                          <Input placeholder='Stock area' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='stock_section_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <FormControl>
                          <Input placeholder='Section' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right column */}
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='dye_lot'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dye Lot</FormLabel>
                        <FormControl>
                          <Input placeholder='Dye lot' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='comments'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comments</FormLabel>
                        <FormControl>
                          <textarea
                            className='flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                            placeholder='Comments...'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInventoryModal
