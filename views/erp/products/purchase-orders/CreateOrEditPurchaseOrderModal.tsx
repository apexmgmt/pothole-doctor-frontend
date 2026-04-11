'use client'

import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import { BusinessLocation, Courier, Product, ProductCategory, ServiceType, Vendor, Warehouse } from '@/types'
import { PurchaseOrder, PurchaseOrderPayload, PurchaseProductPayload } from '@/types/products/purchase_orders'
import AddedProductsTable from './AddedProductsTable'
import OrderDetailsForm from './OrderDetailsForm'
import ProductsSection from './ProductsSection'
import TotalsSection from './TotalsSection'
import type { AddedProduct, FormValues } from './types'

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
      status: 'new',
      tax_amount: '',
      comments: ''
    }
  })

  const warehouseType = form.watch('warehouse_type')
  const shippingCost = Number(form.watch('est_shipping_cost')) || 0
  const taxAmount = Number(form.watch('tax_amount')) || 0

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

          setAddedProducts(
            (po.purchase_products ?? []).map(pp => ({
              product_id: pp.product_id,
              vendor_id: pp.vendor_id,
              product: pp.product as Product,
              quantity: pp.quantity,
              company_cost: pp.purchase_cost,
              work_order_cost: pp.work_order_cost,
              margin: pp.margin,
              customer_price: pp.customer_price
            }))
          )

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
            status: ((po as any).status ?? 'pending') as FormValues['status'],
            tax_amount: (po as any).tax_amount ?? '',
            comments: po.comments ?? ''
          })
        })
        .catch(() => toast.error('Failed to load purchase order details'))
        .finally(() => setIsLoading(false))
    }
  }, [open])

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
      toast.info('Only one vendor allowed per purchase order, so existing products were replaced.')
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
      customer_price: p.p
    }))

    const payload: PurchaseOrderPayload = {
      vendor_id: values.vendor_id,
      status: values.status,
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
        <div className='flex items-center justify-end w-full'>
          {/* <Button type='button' variant='outline' onClick={() => {}} disabled={isLoading}>
            Print Purchase Order
          </Button> */}
          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
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

          <ProductsSection
            selectedVendorId={selectedVendorId}
            selectedProductRows={selectedProductRows}
            setSelectedProductRows={setSelectedProductRows}
            vendors={vendors}
            productCategories={productCategories}
            serviceTypes={serviceTypes}
            onAddSelected={handleAddSelectedProducts}
          />

          <OrderDetailsForm
            form={form}
            couriers={couriers}
            warehouses={warehouses}
            businessLocations={businessLocations}
            warehouseType={warehouseType}
          />

          <AddedProductsTable
            addedProducts={addedProducts}
            onRemove={handleRemoveProduct}
            onFieldChange={handleProductFieldChange}
          />

          <TotalsSection
            form={form}
            totalProductCost={totalProductCost}
            shippingCost={shippingCost}
            finalCost={finalCost}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPurchaseOrderModal
