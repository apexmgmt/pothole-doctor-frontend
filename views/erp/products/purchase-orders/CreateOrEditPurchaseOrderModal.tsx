'use client'

import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/datePicker'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import { BusinessLocation, Courier, Product, ProductCategory, ServiceType, Vendor, Warehouse } from '@/types'
import { PurchaseOrder, PurchaseOrderPayload, PurchaseProductPayload } from '@/types/products/purchase_orders'
import Products from '../Products'

interface AddedProduct {
  product_id: string
  vendor_id: string
  product: Product
  quantity: number
  company_cost: number
  work_order_cost: number
  margin: number
  customer_price: number
}

interface FormValues {
  vendor_id: string
  courier_id: string
  reference_number: string
  est_departure_date: Date | null
  est_arrival_date: Date | null
  est_shipping_cost: number | string
  warehouse_type: 'warehouse' | 'location'
  warehouse_id: string
  payment_due: '' | 'on_arrival' | 'paid'
  tax_amount: number | string
  comments: string
}

interface CreateOrEditPurchaseOrderModalProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  purchaseOrderId?: string
  vendors: Vendor[]
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
  couriers: Courier[]
  productCategories: ProductCategory[]
  serviceTypes: ServiceType[]
}

const CreateOrEditPurchaseOrderModal = ({
  mode,
  open,
  onOpenChange,
  onSuccess,
  purchaseOrderId,
  vendors,
  warehouses,
  businessLocations,
  couriers,
  productCategories,
  serviceTypes
}: CreateOrEditPurchaseOrderModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string>('')
  const [addedProducts, setAddedProducts] = useState<AddedProduct[]>([])
  const [selectedProductRows, setSelectedProductRows] = useState<Product[]>([])

  const form = useForm<FormValues>({
    defaultValues: {
      vendor_id: '',
      courier_id: '',
      reference_number: '',
      est_departure_date: null,
      est_arrival_date: null,
      est_shipping_cost: '',
      warehouse_type: 'warehouse',
      warehouse_id: '',
      payment_due: '',
      tax_amount: '',
      comments: ''
    }
  })

  const warehouseType = form.watch('warehouse_type')
  const shippingCost = Number(form.watch('est_shipping_cost')) || 0
  const taxAmount = Number(form.watch('tax_amount')) || 0

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) return

    if (mode === 'create') {
      form.reset()
      setSelectedVendorId('')
      setAddedProducts([])
      setSelectedProductRows([])

      return
    }

    if (mode === 'edit' && purchaseOrderId) {
      setIsLoading(true)
      PurchaseOrderService.show(purchaseOrderId)
        .then(response => {
          const po = response.data as PurchaseOrder

          setSelectedVendorId(po.vendor_id)
          setSelectedProductRows([])

          const mapped: AddedProduct[] = (po.purchase_products ?? []).map(pp => ({
            product_id: pp.product_id,
            vendor_id: pp.vendor_id,
            product: pp.product as Product,
            quantity: pp.quantity,
            company_cost: pp.purchase_cost,
            work_order_cost: pp.work_order_cost,
            margin: pp.margin,
            customer_price: pp.customer_price
          }))

          setAddedProducts(mapped)

          form.reset({
            vendor_id: po.vendor_id,
            courier_id: po.courier_id ?? '',
            reference_number: po.reference_number ?? '',
            est_departure_date: po.est_departure_date ? new Date(po.est_departure_date) : null,
            est_arrival_date: po.est_arrival_date ? new Date(po.est_arrival_date) : null,
            est_shipping_cost: po.est_shipping_cost ?? '',
            warehouse_type: po.warehouse_type ?? 'warehouse',
            warehouse_id: po.warehouse_id ?? '',
            payment_due: ((po as any).payment_due ?? '') as FormValues['payment_due'],
            tax_amount: (po as any).tax_amount ?? '',
            comments: po.comments ?? ''
          })
        })
        .catch(() => toast.error('Failed to load purchase order details'))
        .finally(() => setIsLoading(false))
    }
  }, [open])

  // Update vendor_id field when selectedVendorId changes
  useEffect(() => {
    form.setValue('vendor_id', selectedVendorId)
  }, [selectedVendorId])

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendorId(vendorId)
    setSelectedProductRows([])
  }

  const handleAddSelectedProducts = () => {
    if (selectedProductRows.length === 0) {
      toast.error('Please select at least one product')

      return
    }

    const incomingVendorId = selectedProductRows[0]?.vendor_id
    const existingVendorId = addedProducts[0]?.vendor_id
    const isDifferentVendor = !!existingVendorId && incomingVendorId !== existingVendorId

    // If adding products from a different vendor, replace existing list
    const baseList = isDifferentVendor ? [] : addedProducts

    const newProducts: AddedProduct[] = selectedProductRows
      .filter(p => !baseList.some(ap => ap.product_id === p.id))
      .map(p => {
        const companyCost = p.product_cost ?? 0
        const coverage = p.coverage_per_rate

        const workOrderCost = coverage ? Number((companyCost / coverage).toFixed(4)) : (p.work_order_cost ?? 0)

        return {
          product_id: p.id,
          vendor_id: p.vendor_id,
          product: p,
          quantity: 1,
          company_cost: companyCost,
          work_order_cost: workOrderCost,
          margin: p.margin ?? 0,
          customer_price: p.selling_price ?? 0
        }
      })

    setAddedProducts([...baseList, ...newProducts])
    setSelectedProductRows([])

    if (isDifferentVendor) {
      toast.info(
        'Only one vendor allowed per purchase order, so existing products were replaced with the newly selected ones.'
      )
    }
  }

  const handleRemoveProduct = (productId: string) => {
    setAddedProducts(prev => prev.filter(p => p.product_id !== productId))
  }

  const handleProductFieldChange = (
    productId: string,
    field: 'quantity' | 'company_cost' | 'work_order_cost',
    value: number
  ) => {
    setAddedProducts(prev =>
      prev.map(p => {
        if (p.product_id !== productId) return p

        const coverage = p.product.coverage_per_rate

        if (field === 'company_cost' && coverage) {
          return { ...p, company_cost: value, work_order_cost: Number((value / coverage).toFixed(4)) }
        }

        if (field === 'work_order_cost' && coverage) {
          return { ...p, work_order_cost: value, company_cost: Number((value * coverage).toFixed(4)) }
        }

        return { ...p, [field]: value }
      })
    )
  }

  // Totals
  const totalProductCost = addedProducts.reduce((sum, p) => sum + p.company_cost * p.quantity, 0)
  const finalCost = totalProductCost + shippingCost + taxAmount

  const onSubmit = async (values: FormValues) => {
    if (!values.vendor_id) {
      toast.error('Please select a vendor')

      return
    }

    if (addedProducts.length === 0) {
      toast.error('Please add at least one product')

      return
    }

    if (!values.warehouse_id) {
      toast.error('Please select a warehouse')

      return
    }

    setIsLoading(true)

    const products: PurchaseProductPayload[] = addedProducts.map(p => ({
      product_id: p.product_id,
      vendor_id: p.vendor_id,
      company_cost: p.company_cost,
      quantity: p.quantity,
      work_order_cost: p.work_order_cost,
      margin: p.margin,
      customer_price: p.customer_price
    }))

    const payload: PurchaseOrderPayload = {
      vendor_id: values.vendor_id,
      status: 'new',
      courier_id: values.courier_id,
      warehouse_type: values.warehouse_type,
      warehouse_id: values.warehouse_id,
      est_departure_date: values.est_departure_date ? format(values.est_departure_date, 'yyyy-MM-dd') : '',
      est_arrival_date: values.est_arrival_date ? format(values.est_arrival_date, 'yyyy-MM-dd') : '',
      est_shipping_cost: Number(values.est_shipping_cost) || 0,
      payment_due: values.payment_due || null,
      tax_amount: Number(values.tax_amount) || 0,
      final_cost: finalCost,
      comments: values.comments || null,
      reference_number: values.reference_number,
      products
    }

    try {
      if (mode === 'create') {
        await PurchaseOrderService.store(payload)
        toast.success('Purchase order created successfully')
      } else if (mode === 'edit' && purchaseOrderId) {
        await PurchaseOrderService.update(purchaseOrderId, payload)
        toast.success('Purchase order updated successfully')
      }

      onOpenChange(false)
      onSuccess()
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
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add New Purchase Order' : 'Edit Purchase Order'}
      description=''
      maxWidth='full'
      isLoading={isLoading}
      loadingMessage={mode === 'create' ? 'Creating purchase order...' : 'Updating purchase order...'}
      disableClose={isLoading}
      actions={
        <div className='flex items-center justify-between w-full'>
          <Button type='button' variant='outline' onClick={() => {}} disabled={isLoading}>
            Print Purchase Order
          </Button>
          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' form='purchase-order-form' disabled={isLoading}>
              {isLoading ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Save' : 'Update'}
            </Button>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <form id='purchase-order-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Vendor Selector */}
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <FormField
                control={form.control}
                name='vendor_id'
                rules={{ required: 'Vendor is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={selectedVendorId}
                        onValueChange={val => {
                          field.onChange(val)
                          handleVendorChange(val)
                        }}
                      >
                        <SelectTrigger className='w-72'>
                          <SelectValue placeholder='Select Vendor' />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.map(v => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.first_name} {v.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Products Table */}
          <div className='flex flex-col gap-3'>
            <div className='border border-border rounded-lg overflow-hidden min-h-[450px] max-h-[450px]'>
              {selectedVendorId ? (
                <Products
                  productCategories={productCategories}
                  uomUnits={[]}
                  serviceTypes={serviceTypes}
                  vendors={vendors}
                  isFromModal={true}
                  selectedRows={selectedProductRows}
                  setSelectedRows={setSelectedProductRows}
                  selected_vendor_id={selectedVendorId}
                  hideTitle={true}
                  hideActionButton={true}
                />
              ) : (
                <div className='flex items-center justify-center h-full min-h-[450px] text-muted-foreground text-sm'>
                  Select a vendor to browse products
                </div>
              )}
            </div>

            <div className='flex justify-end'>
              <Button
                type='button'
                size='sm'
                onClick={handleAddSelectedProducts}
                disabled={selectedProductRows.length === 0 || !selectedVendorId}
              >
                <PlusIcon className='w-4 h-4 mr-1' />
                Add Selected Products
              </Button>
            </div>
          </div>

          {/* Order Details Form — 4 columns on large screens */}
          <div className='border border-border rounded-lg p-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <FormField
                control={form.control}
                name='courier_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carrier</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Carrier' />
                        </SelectTrigger>
                        <SelectContent>
                          {couriers.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='reference_number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Reference Number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='est_departure_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Departure</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Est. Departure' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='est_arrival_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Arrival</FormLabel>
                    <FormControl>
                      <DatePicker value={field.value} onChange={field.onChange} placeholder='Est. Arrival' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='est_shipping_cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Shipping Cost</FormLabel>
                    <FormControl>
                      <Input type='number' step='any' min={0} placeholder='0.00' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='warehouse_type'
                rules={{ required: 'Warehouse type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Warehouse Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={val => {
                          field.onChange(val)
                          form.setValue('warehouse_id', '')
                        }}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='warehouse'>Warehouse</SelectItem>
                          <SelectItem value='location'>Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                key={`warehouse_id-${warehouseType}`}
                control={form.control}
                name='warehouse_id'
                rules={{ required: 'Warehouse is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Warehouse <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue
                            placeholder={warehouseType === 'warehouse' ? 'Select Warehouse' : 'Select Location'}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouseType === 'warehouse'
                            ? warehouses.map(w => (
                                <SelectItem key={w.id} value={w.id}>
                                  {w.title}
                                </SelectItem>
                              ))
                            : businessLocations.map(l => (
                                <SelectItem key={l.id} value={l.id}>
                                  {l.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='payment_due'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Due</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Payment Type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='on_arrival'>On Arrival</SelectItem>
                          <SelectItem value='paid'>Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='comments'
                render={({ field }) => (
                  <FormItem className='sm:col-span-2 lg:col-span-4'>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Comments...' rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Added Products Table */}
          {addedProducts.length > 0 && (
            <div className='border border-border rounded-lg overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border bg-border/20'>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Mat. #</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>SKU</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Product Name</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Description</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Style</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Color</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground w-24'>Quantity</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>UOM</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Total Coverage</th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>
                      <div>Company Cost</div>
                      <div className='font-normal text-xs'>WO Cost</div>
                    </th>
                    <th className='text-left px-3 py-2 font-medium text-muted-foreground'>Total</th>
                    <th className='w-8'></th>
                  </tr>
                </thead>
                <tbody>
                  {addedProducts.map((ap, index) => {
                    const totalCoverage =
                      ap.product.coverage_per_rate != null
                        ? Number((ap.quantity * ap.product.coverage_per_rate).toFixed(2))
                        : null

                    const rowTotal = Number((ap.company_cost * ap.quantity).toFixed(2))

                    return (
                      <tr key={ap.product_id} className='border-b border-border last:border-0'>
                        <td className='px-3 py-2 text-muted-foreground'>{index + 1}</td>
                        <td className='px-3 py-2'>{ap.product.sku}</td>
                        <td className='px-3 py-2'>
                          {ap.product.vendor_product_name || ap.product.private_product_name}
                        </td>
                        <td className='px-3 py-2 text-muted-foreground'>{ap.product.description || '—'}</td>
                        <td className='px-3 py-2'>{ap.product.vendor_style || ap.product.private_style || '—'}</td>
                        <td className='px-3 py-2'>{ap.product.vendor_color || ap.product.private_color || '—'}</td>
                        <td className='px-3 py-2'>
                          <Input
                            type='number'
                            min={1}
                            step='any'
                            value={ap.quantity}
                            onChange={e => handleProductFieldChange(ap.product_id, 'quantity', Number(e.target.value))}
                            className='h-7 text-xs w-20'
                          />
                        </td>
                        <td className='px-3 py-2'>
                          {ap.product.purchase_unit?.name ?? ap.product.purchase_uom?.name ?? '—'}
                        </td>
                        <td className='px-3 py-2'>
                          {totalCoverage != null
                            ? `${totalCoverage} (${ap.product.coverage_unit?.name ?? ap.product.coverage_uom?.name ?? ''})`
                            : '—'}
                        </td>
                        <td className='px-3 py-2'>
                          <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-1'>
                              <Input
                                type='number'
                                min={0}
                                step='any'
                                value={ap.company_cost}
                                onChange={e =>
                                  handleProductFieldChange(ap.product_id, 'company_cost', Number(e.target.value))
                                }
                                className='h-7 text-xs w-24'
                              />
                              <span className='text-xs text-muted-foreground whitespace-nowrap'>
                                {ap.product.purchase_unit?.name ?? ap.product.purchase_uom?.name ?? ''}
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Input
                                type='number'
                                min={0}
                                step='any'
                                value={ap.work_order_cost}
                                onChange={e =>
                                  handleProductFieldChange(ap.product_id, 'work_order_cost', Number(e.target.value))
                                }
                                className='h-7 text-xs w-24'
                              />
                              <span className='text-xs text-muted-foreground whitespace-nowrap'>
                                {ap.product.selling_unit?.name ?? ap.product.selling_uom?.name ?? ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className='px-3 py-2'>${rowTotal.toFixed(2)}</td>
                        <td className='px-3 py-2'>
                          <button
                            type='button'
                            onClick={() => handleRemoveProduct(ap.product_id)}
                            className='text-muted-foreground hover:text-destructive transition-colors'
                          >
                            <Trash2Icon className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Totals */}
          <div className='flex justify-end'>
            <div className='w-72 space-y-1 text-sm border border-border rounded-lg p-4'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total Product Cost:</span>
                <span className='font-medium'>${totalProductCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shipping Cost:</span>
                <span className='font-medium'>${shippingCost.toFixed(2)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-muted-foreground'>Tax:</span>
                <FormField
                  control={form.control}
                  name='tax_amount'
                  render={({ field }) => (
                    <FormItem className='mb-0'>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step='any'
                          placeholder='0.00'
                          {...field}
                          className='h-7 text-xs w-24 text-right'
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className='flex justify-between border-t border-border pt-2 font-semibold'>
                <span>Final Cost:</span>
                <span>${finalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPurchaseOrderModal
