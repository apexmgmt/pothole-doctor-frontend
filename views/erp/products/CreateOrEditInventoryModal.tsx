'use client'

import { ReactNode, useEffect, useState } from 'react'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Product } from '@/types'
import { InventoryPayload, PurchaseOrder } from '@/types/products/purchase_orders'
import { Warehouse, BusinessLocation } from '@/types'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'
import InventoryService from '@/services/api/products/inventories.service'
import { getMargin, getSellPrice } from '@/utils/business-calculation'

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

type FormFieldType = {
  name: Path<FormValues>
  type?: InputType
  label?: string
  placeholder?: string
  rules?: RegisterOptions<FormValues, Path<FormValues>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
  onBlur?: () => void
  unit?: string
  fieldClassName?: string
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
  const [isExpanded, setIsExpanded] = useState(true)

  const purchaseProduct = inventoryDetails?.purchase_products?.[0]

  const defaultMargin = product.margin ?? ''
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

  const {
    watch,
    setValue,
    control,
    register,
    getValues,
    handleSubmit,
    reset,
    formState: { errors }
  } = form

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
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
      reset()
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
    reset()
  }

  const displayField = (label: string, value: string | number | null | undefined, index?: number) => {
    const isFirst2 = index !== undefined && index % 2 === 0
    const isFirst3 = index !== undefined && index % 3 === 0
    const isFirst4 = index !== undefined && index % 4 === 0
    const isFirst5 = index !== undefined && index % 5 === 0

    const borderClass = cn(
      isFirst2 ? 'border-l-0 pl-0' : 'border-l border-border pl-3',
      isFirst3 ? 'sm:border-l-0 sm:pl-0' : 'sm:border-l sm:border-border sm:pl-3',
      isFirst4 ? 'md:border-l-0 md:pl-0' : 'md:border-l md:border-border md:pl-3',
      isFirst5 ? 'lg:border-l-0 lg:pl-0' : 'lg:border-l lg:border-border lg:pl-3'
    )

    return (
      <div key={`${label}-${index}`} className={cn('flex flex-col gap-1.25', borderClass)}>
        <span className='text-xs text-muted-foreground font-normal leading-none'>{label}</span>
        <span className='text-[13px] font-medium leading-tight'>{value ?? '-'}</span>
      </div>
    )
  }

  const warehouseType = watch('warehouse_type')
  const isLocation = warehouseType === 'location'

  const uomFields: FormFieldType[] = [
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantity',
      rules: { required: 'Quantity is required' },
      unit: product.purchase_unit?.name ?? product.purchase_uom?.name ?? 'Each'
    }
  ]

  const pricingFields: FormFieldType[] = [
    {
      name: 'company_cost',
      type: 'number',
      label: 'Company Cost',
      rules: { required: 'Company Cost is required' },
      unit: product.purchase_unit?.name ?? product.purchase_uom?.name,
      fieldClassName: 'grid-cols-[92px_minmax(0,_1fr)]!'
    },
    {
      name: 'work_order_cost',
      type: 'number',
      label: 'WO. Cost',
      rules: { required: 'Work Order Cost is required' },
      onBlur: () => {
        const newWoCost = Number(getValues('work_order_cost'))
        const margin = Number(getValues('margin'))

        setValue('customer_price', getSellPrice(newWoCost, margin))
      },
      fieldClassName: 'grid-cols-[68px_minmax(0,_1fr)]!'
    },
    {
      name: 'customer_price',
      type: 'number',
      label: 'Customer Price',
      unit: product.selling_unit?.name ?? product.selling_uom?.name,
      placeholder: '0.00',
      onBlur: () => {
        const newSellPrice = Number(getValues('customer_price'))
        const woCost = Number(getValues('work_order_cost'))

        setValue('margin', getMargin(woCost, newSellPrice))
      },
      fieldClassName: 'grid-cols-[92px_minmax(0,_1fr)]!'
    },
    {
      name: 'margin',
      type: 'number',
      label: 'Margin (%)',
      placeholder: '0.00',
      onBlur: () => {
        const newMargin = Number(getValues('margin'))
        const woCost = Number(getValues('work_order_cost'))

        setValue('customer_price', getSellPrice(woCost, newMargin))
      },
      fieldClassName: 'grid-cols-[68px_minmax(0,_1fr)]!'
    }
  ]

  const poFields: FormFieldType[] = [
    {
      name: 'warehouse_type',
      type: 'select',
      label: 'Warehouse Type',
      rules: { required: 'Warehouse type is required' },
      selectOptions: [
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'location', label: 'Location' }
      ],
      onChange: () => {
        setValue('warehouse_id', '')
      },
      fieldClassName: 'self-end'
    },
    {
      name: 'stock_section_id',
      type: 'text',
      label: 'Section',
      placeholder: 'Section'
    },
    {
      name: 'warehouse_id',
      type: 'select',
      label: isLocation ? 'Location' : 'Warehouse',
      placeholder: isLocation ? 'Select location' : 'Select warehouse',
      selectOptions: isLocation
        ? businessLocations.map(loc => ({ value: loc.id, label: loc.name }))
        : warehouses.map(w => ({ value: w.id, label: w.title }))
    },
    {
      name: 'dye_lot',
      type: 'text',
      label: 'Dye Lot',
      placeholder: 'Dye lot'
    },
    {
      name: 'stock_area',
      type: 'text',
      label: 'Stock Area',
      placeholder: 'Stock area'
    },
    {
      name: 'comments',
      type: 'textarea',
      label: 'Comments',
      placeholder: 'Comments...'
    }
  ]

  const sharedFieldClass = 'grid grid-cols-[108px_minmax(0,_1fr)] gap-2'
  const sharedLabelClass = 'justify-end items-start self-start text-right pt-1.5'

  const renderFormField = (field: FormFieldType) => {
    const formField = (
      <CustomFormField
        key={field.unit ? undefined : field.name}
        {...field}
        register={register}
        control={control}
        errors={errors}
        fieldClassName={`${sharedFieldClass} ${field.fieldClassName || ''}`}
        labelClassName={sharedLabelClass}
      />
    )

    if (field.unit) {
      return (
        <div key={field.name} className='flex items-start gap-1.5'>
          {formField}

          <p className='w-[146px] text-xs leading-none text-muted-foreground pt-2 line-clamp-1'>{field.unit}</p>
        </div>
      )
    }

    return formField
  }

  const renderReadOnlyField = (label: string, value: string | number | null | undefined) => {
    return (
      <div className='px-3.75 py-2.25 bg-[#4D4D4D66] border border-border rounded-lg flex items-center gap-2.5'>
        <p className='text-xs leading-none text-muted-foreground'>{label}</p>
        <p className='text-[13px] leading-none font-medium'>{value ?? '—'}</p>
      </div>
    )
  }

  const SharedCard = ({
    title,
    children,
    contentClass
  }: {
    title: string
    children: ReactNode
    contentClass?: string
  }) => {
    return (
      <Card className='p-4 border border-border'>
        <CardHeader className='p-0'>
          <CardTitle className='text-base font-medium leading-none mb-0'>{title}</CardTitle>
        </CardHeader>

        <CardContent className={`mt-4 p-0 ${contentClass}`}>{children}</CardContent>
      </Card>
    )
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add New Inventory' : 'Edit Inventory'}
      className='sm:max-w-[1180px]'
      isLoading={isLoading}
      loadingMessage={mode === 'create' ? 'Creating inventory...' : 'Updating inventory...'}
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' size='sm' form='inventory-form' disabled={isLoading}>
            {isLoading ? (mode === 'create' ? 'Creating...' : 'Saving...') : mode === 'create' ? 'Save' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='inventory-form' onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Product Information */}
          <Card className='p-4 border border-border'>
            <CardHeader
              className='p-0 flex flex-row items-center justify-between gap-2 cursor-pointer select-none'
              onClick={() => setIsExpanded(prev => !prev)}
            >
              <CardTitle className='text-base font-medium leading-none mb-0'>Product Information</CardTitle>
              <ChevronDown
                className={`size-5 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </CardHeader>

            {isExpanded && (
              <CardContent className='mt-4 p-2.5 bg-[#1F1F1F] rounded-lg grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6'>
                {[
                  { label: 'Vendor', value: product.vendor?.first_name },
                  { label: 'Category', value: product.category?.name },
                  { label: 'SKU', value: product.sku },
                  { label: 'Size/Description', value: product.description },
                  { label: 'Vendor Product Name', value: product.vendor_product_name },
                  { label: 'Private Product Name', value: product.private_product_name },
                  { label: 'Vendor Style', value: product.vendor_style },
                  {
                    label: product.vendor_style ? `${product.vendor_style} Private Style` : 'Private Style',
                    value: product.private_style
                  },
                  { label: 'Vendor Color', value: product.vendor_color },
                  { label: 'Private Color', value: product.private_color }
                ].map((field, idx) => displayField(field.label, field.value, idx))}
              </CardContent>
            )}
          </Card>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {/* UOM / Coverage Information */}
            <SharedCard title='UOM/Coverage Information' contentClass='space-y-3'>
              {uomFields.map(renderFormField)}

              {renderReadOnlyField(
                'Coverage per UOM',
                `${product.coverage_per_rate} (${product.coverage_unit?.name ?? product.coverage_uom?.name ?? 'Each'})`
              )}
            </SharedCard>

            {/* Product Cost / Pricing */}
            <SharedCard title='Product Cost/Pricing' contentClass='grid grid-cols-[5fr_3fr] gap-x-4 gap-y-2'>
              {pricingFields.map(renderFormField)}
            </SharedCard>
          </div>

          {/* Purchase Order Information */}
          <SharedCard title='Purchase Order Information' contentClass='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            {mode === 'edit' &&
              renderReadOnlyField(
                'PO#',
                inventoryDetails?.purchase_order_number != null ? `PO-${inventoryDetails.purchase_order_number}` : '—'
              )}

            {poFields.map(renderFormField)}
          </SharedCard>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInventoryModal
