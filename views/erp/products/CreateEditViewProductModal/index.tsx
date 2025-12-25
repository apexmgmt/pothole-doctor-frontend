'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { ProductPayload, ProductsProps, Product, Unit, ProductGallery } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ProductService from '@/services/api/products/products.service'
import ProductGalleryService from '@/services/api/products/product-galleries.service'
import { Separator } from '@/components/ui/separator'
import { BasicProductFields } from './BasicProductFields'
import { UOMFields } from './UOMFields'
import { PricingFields } from './PricingFields'
import { AdditionalInfoFields } from './AdditionalInfoFields'
import { ProductGallerySection } from './ProductGallerySection'

interface CreateEditViewProductModalProps extends ProductsProps {
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

const CreateEditViewProductModal = ({
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
}: CreateEditViewProductModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [galleries, setGalleries] = useState<ProductGallery[]>(productDetails?.galleries || [])
  const [isLoadingGalleries, setIsLoadingGalleries] = useState<boolean>(false)

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

  // Fetch galleries when in edit or view mode
  const fetchGalleries = async (prodId: string) => {
    setIsLoadingGalleries(true)

    try {
      const response = await ProductGalleryService.index(prodId)

      setGalleries(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch product galleries')
    } finally {
      setIsLoadingGalleries(false)
    }
  }

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
        purchase_uom: productDetails.purchase_uom ?? '',
        uom_info: {
          carton_per_pallet: productDetails.uom_info?.carton_per_pallet ?? 0,
          piece_per_carton: productDetails.uom_info?.piece_per_carton ?? 0,
          lb: productDetails.uom_info?.lb ?? 0
        },
        coverage_per_uom: {
          value: productDetails.coverage_per_uom?.value ?? 0,
          unit: productDetails.coverage_per_uom?.unit ?? undefined
        },
        product_cost: productDetails.product_cost ?? 0,
        margin: productDetails.margin?.toString() ?? '0',
        selling_info: {
          value: productDetails.selling_info?.value ?? 0,
          unit: productDetails.selling_info?.unit ?? undefined
        },
        minimum_qty: productDetails.minimum_qty ?? 0,
        round_up_quantity: productDetails.round_up_quantity ?? 0,
        type: productDetails.type ?? 'inventory',
        is_notify: productDetails.is_notify ?? 0,
        visible: productDetails.visible ?? 1,
        is_freight_percentage: productDetails.is_freight_percentage ?? 0,
        is_discontinued_product: productDetails.is_discontinued_product ?? 0,
        comments: productDetails.comments ?? '',
        status: productDetails.status ?? 1,
        sku: productDetails.sku ?? ''
      })

      // Fetch galleries
      // fetchGalleries(productId)
    } else if (open && mode === 'create') {
      setGalleries([])
      form.reset({
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
      })
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
      purchase_uom: values.purchase_uom,
      uom_info: values.uom_info,
      coverage_per_uom: {
        value: values.coverage_per_uom.value,
        unit: values.coverage_per_uom.unit
      },
      product_cost: values.product_cost,
      margin: values.margin,
      selling_info: {
        value: values.selling_info.value,
        unit: values.selling_info.unit
      },
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
      if (mode === 'create') {
        await ProductService.store(payload)
        toast.success('Product created successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && productId) {
        await ProductService.update(productId, payload)
        toast.success('Product updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
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

  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Create New Product'
      case 'edit':
        return 'Edit Product'
      case 'view':
        return 'View Product'
      default:
        return 'Product'
    }
  }

  const getDescription = () => {
    switch (mode) {
      case 'create':
        return 'Add a new product to the system'
      case 'edit':
        return 'Update product information'
      case 'view':
        return 'View product details'
      default:
        return ''
    }
  }

  const handleGalleryUpdate = () => {
    if (productId) {
      fetchGalleries(productId)
    }
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage={
        mode === 'create' ? 'Creating product...' : mode === 'edit' ? 'Updating product...' : 'Loading product...'
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
          <div className={`grid grid-cols-1 ${mode !== 'create' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
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

              {/* Additional Information */}
              <AdditionalInfoFields form={form} disabled={mode === 'view'} />
            </div>

            {/* Gallery Section - Only show in edit/view mode */}
            {mode !== 'create' && productId && (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Product Gallery</h3>
                <ProductGallerySection
                  productId={productId}
                  galleries={galleries}
                  isLoading={isLoadingGalleries}
                  onUpdate={handleGalleryUpdate}
                  disabled={mode === 'view'}
                />
              </div>
            )}
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateEditViewProductModal
