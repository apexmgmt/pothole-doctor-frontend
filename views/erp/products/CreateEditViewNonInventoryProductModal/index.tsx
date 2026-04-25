'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { ProductPayload, ProductsProps, Product } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import { Separator } from '@/components/ui/separator'
import { BasicProductFields } from '../CreateEditViewProductModal/BasicProductFields'
import { UOMFields } from '../CreateEditViewProductModal/UOMFields'
import { PricingFields } from '../CreateEditViewProductModal/PricingFields'
import { AdditionalInfoFields } from '../CreateEditViewProductModal/AdditionalInfoFields'

interface CreateEditViewNonInventoryProductModalProps extends ProductsProps {
  mode?: 'create' | 'edit' | 'view'
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
  productDetails?: Product
  onSuccess?: () => void
}

interface FormValues {
  name: string
  vendor_id: string
  category_id: string
  service_type_id: string[]
  is_rolled_good: number
  vendor_product_name: string
  vendor_style: string
  vendor_color: string
  private_product_name: string
  private_style: string
  private_color: string
  collection: string
  dropped_date: string
  description: string
  purchase_uom_id: string
  unit_per_pallet: number
  piece_per_uom: number
  weight_per_uom: number
  coverage_per_unit_id: string
  coverage_per_rate: number
  purchase_to_selling_conversion_rate: number
  selling_unit_id: string
  selling_price: number
  product_cost: number
  margin: string
  freight_amount: number
  minimum_qty: number
  round_up_quantity: boolean
  type: string
  is_notify: number
  visible: number
  is_freight_percentage: number
  is_discontinued_product: number
  comments: string
  status: number
  sku: string
}

const defaultValues: FormValues = {
  name: '',
  vendor_id: '',
  category_id: '',
  service_type_id: [],
  is_rolled_good: 0,
  vendor_product_name: '',
  vendor_style: '',
  vendor_color: '',
  private_product_name: '',
  private_style: '',
  private_color: '',
  collection: '',
  dropped_date: '',
  description: '',
  purchase_uom_id: '',
  unit_per_pallet: 0,
  piece_per_uom: 0,
  weight_per_uom: 0,
  coverage_per_unit_id: '',
  coverage_per_rate: 0,
  purchase_to_selling_conversion_rate: 0,
  selling_unit_id: '',
  selling_price: 0,
  product_cost: 0,
  margin: '0',
  freight_amount: 0,
  minimum_qty: 0,
  round_up_quantity: false,
  type: 'non_inventory',
  is_notify: 0,
  visible: 1,
  is_freight_percentage: 0,
  is_discontinued_product: 0,
  comments: '',
  status: 1,
  sku: ''
}

const CreateEditViewNonInventoryProductModal = ({
  mode = 'create',
  open,
  onOpenChange,
  productId,
  productDetails,
  onSuccess,
  productCategories,
  uomUnits,
  serviceTypes,
  vendors
}: CreateEditViewNonInventoryProductModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({ defaultValues })

  useEffect(() => {
    if (open && productDetails && (mode === 'edit' || mode === 'view') && productId) {
      form.reset({
        name: productDetails.name ?? '',
        vendor_id: productDetails.vendor_id?.toString() ?? '',
        category_id: productDetails.category_id?.toString() ?? '',
        service_type_id: productDetails.service_types?.map(st => st.id.toString()) ?? [],
        is_rolled_good: productDetails.is_rolled_good === 'yes' ? 1 : 0,
        vendor_product_name: productDetails.vendor_product_name ?? '',
        vendor_style: productDetails.vendor_style ?? '',
        vendor_color: productDetails.vendor_color ?? '',
        private_product_name: productDetails.private_product_name ?? '',
        private_style: productDetails.private_style ?? '',
        private_color: productDetails.private_color ?? '',
        collection: productDetails.collection ?? '',
        dropped_date: productDetails.dropped_date ?? '',
        description: productDetails.description ?? '',
        purchase_uom_id: productDetails.purchase_uom_id?.toString() ?? '',
        unit_per_pallet: productDetails.unit_per_pallet ?? 0,
        piece_per_uom: productDetails.piece_per_uom ?? 0,
        weight_per_uom: productDetails.weight_per_uom ?? 0,
        coverage_per_unit_id: productDetails.coverage_per_unit_id?.toString() ?? '',
        coverage_per_rate: productDetails.coverage_per_rate ?? 0,
        purchase_to_selling_conversion_rate: productDetails.purchase_to_selling_conversion_rate ?? 0,
        selling_unit_id: productDetails.selling_unit_id?.toString() ?? '',
        selling_price: productDetails.selling_price ?? 0,
        product_cost: productDetails.product_cost ?? 0,
        margin: productDetails.margin?.toString() ?? '0',
        freight_amount: productDetails.freight_amount ?? 0,
        minimum_qty: productDetails.minimum_qty ?? 0,
        round_up_quantity: !!productDetails.round_up_quantity,
        type: productDetails.type ?? 'non_inventory',
        is_notify: productDetails.is_notify ?? 0,
        visible: productDetails.visible ?? 1,
        is_freight_percentage: productDetails.is_freight_percentage ?? 0,
        is_discontinued_product: productDetails.is_discontinued_product ?? 0,
        comments: productDetails.comments ?? '',
        status: productDetails.status ?? 1,
        sku: productDetails.sku ?? ''
      })
    } else if (open && mode === 'create') {
      form.reset(defaultValues)
    }
  }, [open, productDetails, mode, productId, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: ProductPayload = {
      name: values.vendor_product_name,
      vendor_id: values.vendor_id,
      category_id: values.category_id,
      service_type_id: values.service_type_id,
      is_rolled_good: values.is_rolled_good,
      vendor_product_name: values.vendor_product_name,
      vendor_style: values.vendor_style,
      vendor_color: values.vendor_color,
      private_product_name: values.private_product_name,
      private_style: values.private_style,
      private_color: values.private_color,
      collection: values.collection,
      dropped_date: values.dropped_date,
      description: values.description,
      purchase_uom_id: values.purchase_uom_id,
      unit_per_pallet: values.unit_per_pallet,
      piece_per_uom: values.piece_per_uom,
      weight_per_uom: values.weight_per_uom,
      coverage_per_unit_id: values.coverage_per_unit_id,
      coverage_per_rate: values.coverage_per_rate,
      purchase_to_selling_conversion_rate: values.purchase_to_selling_conversion_rate,
      selling_unit_id: values.selling_unit_id,
      selling_price: values.selling_price,
      product_cost: values.product_cost,
      margin: values.margin,
      freight_amount: values.freight_amount,
      minimum_qty: values.minimum_qty,
      round_up_quantity: values.round_up_quantity ? 1 : 0,
      type: values.type,
      is_notify: values.is_notify,
      visible: values.visible,
      is_freight_percentage: values.is_freight_percentage,
      is_discontinued_product: values.is_discontinued_product,
      comments: values.comments,
      status: values.status,
      sku: values.sku
    }

    try {
      if (mode === 'create') {
        await NonInventoryProductService.store(payload)
        toast.success('Non-inventory product created successfully')
        form.reset(defaultValues)
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && productId) {
        await NonInventoryProductService.update(productId, payload)
        toast.success('Non-inventory product updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
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
    form.reset(defaultValues)
    onOpenChange(false)
  }

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Non-Inventory Product'
      case 'edit':
        return 'Edit Non-Inventory Product'
      case 'view':
        return 'View Non-Inventory Product'
      default:
        return 'Non-Inventory Product'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'create':
        return 'Add a new non-inventory product to the system'
      case 'edit':
        return 'Update non-inventory product information'
      case 'view':
        return 'View non-inventory product details'
      default:
        return ''
    }
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage={
        mode === 'create'
          ? 'Creating non-inventory product...'
          : mode === 'edit'
            ? 'Updating non-inventory product...'
            : 'Loading non-inventory product...'
      }
      open={open}
      onOpenChange={onOpenChange}
      title={getTitle()}
      description={getDescription()}
      maxWidth='7xl'
      disableClose={form.formState.isSubmitting}
      actions={
        mode !== 'view' ? (
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
              className='flex-1'
            >
              {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        ) : (
          <Button type='button' variant='outline' onClick={onCancel}>
            Close
          </Button>
        )
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mb-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Basic Product Information */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>Product Information</h3>
              <BasicProductFields
                form={form}
                vendors={vendors}
                productCategories={productCategories}
                serviceTypes={serviceTypes}
                disabled={mode === 'view'}
              />
            </div>

            {/* UOM and Properties */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>UOM and Other Properties</h3>
              <UOMFields form={form} uomUnits={uomUnits} disabled={mode === 'view'} />
              <Separator />
              <PricingFields form={form} uomUnits={uomUnits} disabled={mode === 'view'} />
              <Separator />
              <AdditionalInfoFields form={form} disabled={mode === 'view'} />
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateEditViewNonInventoryProductModal
