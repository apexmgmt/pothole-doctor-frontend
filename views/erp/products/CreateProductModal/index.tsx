'use client'

import { ProductPayload, ProductsProps, Product, Unit } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ProductService from '@/services/api/products.service'
import { Separator } from '@/components/ui/separator'
import { BasicProductFields } from './BasicProductFields'
import { UOMFields } from './UOMFields'
import { PricingFields } from './PricingFields'
import { AdditionalInfoFields } from './AdditionalInfoFields'

interface CreateProductModalProps extends ProductsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  purchase_uom: string
  uom_info: {
    carton_per_pallet: number
    piece_per_carton: number
    lb: number
  }
  coverage_per_uom: {
    value: number
    unit: Unit
  }
  product_cost: number
  margin: string
  selling_info: {
    value: number
    unit: Unit
  }
  minimum_qty: number
  round_up_quantity: number
  type: string
  is_notify: number
  visible: number
  is_freight_percentage: number
  is_discontinued_product: number
  comments: string
  status: number
  sku: string
}

const CreateProductModal = ({
  open,
  onOpenChange,
  onSuccess,
  productCategories,
  uomUnits,
  serviceTypes,
  vendors
}: CreateProductModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
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
      purchase_uom: '',
      uom_info: {
        carton_per_pallet: 0,
        piece_per_carton: 0,
        lb: 0
      },
      coverage_per_uom: {
        value: 0,
        unit: undefined
      },
      product_cost: 0,
      margin: '0',
      selling_info: {
        value: 0,
        unit: undefined
      },
      minimum_qty: 0,
      round_up_quantity: 0,
      type: 'inventory',
      is_notify: 0,
      visible: 1,
      is_freight_percentage: 0,
      is_discontinued_product: 0,
      comments: '',
      status: 1,
      sku: ''
    }
  })

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
      purchase_uom: values.purchase_uom,
      uom_info: values.uom_info,
      coverage_per_uom: values.coverage_per_uom,
      product_cost: values.product_cost,
      margin: values.margin,
      selling_info: values.selling_info,
      minimum_qty: values.minimum_qty,
      round_up_quantity: values.round_up_quantity,
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
      await ProductService.store(payload)
      toast.success('Product created successfully')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to save product')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading product...'
      open={open}
      onOpenChange={onOpenChange}
      title={'Create New Product'}
      description={'Add a new product to the system'}
      maxWidth='7xl'
      disableClose={form.formState.isSubmitting}
      actions={
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
            {form.formState.isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
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
              />
            </div>

            {/* UOM and Properties */}
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold'>UOM and Other Properties</h3>
              <UOMFields form={form} uomUnits={uomUnits} />
              <Separator />
              <PricingFields form={form} uomUnits={uomUnits} />
              <Separator />

              {/* Additional Information */}
              <AdditionalInfoFields form={form} />
            </div>
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateProductModal
