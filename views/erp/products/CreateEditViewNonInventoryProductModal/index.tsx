'use client'

import { useEffect, useState } from 'react'

import { Path, RegisterOptions, useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { ProductPayload, ProductsProps, Product, ProductGallery } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import { BasicProductFields } from '../CreateEditViewProductModal/BasicProductFields'
import { UOMFields } from '../CreateEditViewProductModal/UOMFields'
import { PricingFields } from '../CreateEditViewProductModal/PricingFields'
import { AdditionalInfoFields } from '../CreateEditViewProductModal/AdditionalInfoFields'
import { QrCodeSection } from '../CreateEditViewProductModal/QrCodeSection'
import { BarCodeSection } from '../CreateEditViewProductModal/BarCodeSection'
import { ProductGallerySection } from '../CreateEditViewProductModal/ProductGallerySection'
import ProductGalleryService from '@/services/api/products/product-galleries.service'
import { InputType, SelectOption } from '@/components/form/fields/types'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateEditViewNonInventoryProductModalProps extends ProductsProps {
  mode?: 'create' | 'edit' | 'view' | 'duplicate'
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
  minimum_qty: number | string
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

export type FormFieldType = {
  name: Path<FormValues>
  type?: InputType
  label?: string
  placeholder?: string
  rules?: RegisterOptions<FormValues, Path<FormValues>>
  selectOptions?: SelectOption[]
  onChange?: (value: any) => void
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
  coverage_per_rate: 1,
  purchase_to_selling_conversion_rate: 0,
  selling_unit_id: '',
  selling_price: 0,
  product_cost: 0,
  margin: '0',
  freight_amount: 0,
  minimum_qty: '',
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
  const [galleries, setGalleries] = useState<ProductGallery[]>(productDetails?.galleries || [])
  const [isLoadingGalleries, setIsLoadingGalleries] = useState<boolean>(false)

  const [exactMatches, setExactMatches] = useState<Product[]>([])
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = useState<boolean>(false)
  const [pendingFormValues, setPendingFormValues] = useState<FormValues | null>(null)

  const form = useForm<FormValues>({ defaultValues })

  const {
    register,
    control,
    watch,
    formState: { errors }
  } = form

  const watchedVendorId = watch('vendor_id')
  const watchedSku = watch('sku')
  const watchedVendorProductName = watch('vendor_product_name')
  const watchedVendorStyle = watch('vendor_style')
  const watchedVendorColor = watch('vendor_color')

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
    if (!open) {
      form.reset(defaultValues)
      setExactMatches([])

      return
    }

    if (open && productDetails && (mode === 'edit' || mode === 'view' || mode === 'duplicate') && productId) {
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
        coverage_per_rate: productDetails.coverage_per_rate ?? 1,
        purchase_to_selling_conversion_rate: productDetails.purchase_to_selling_conversion_rate ?? 0,
        selling_unit_id: productDetails.selling_unit_id?.toString() ?? '',
        selling_price: productDetails.selling_price ?? 0,
        product_cost: productDetails.product_cost ?? 0,
        margin: productDetails.margin?.toString() ?? '0',
        freight_amount: productDetails.freight_amount ?? 0,
        minimum_qty: productDetails.minimum_qty ?? '',
        round_up_quantity: !!productDetails.round_up_quantity,
        type: productDetails.type ?? 'non_inventory',
        is_notify: productDetails.is_notify ? 1 : 0,
        visible: productDetails.visible ? 1 : 0,
        is_freight_percentage: productDetails.is_freight_percentage ? 1 : 0,
        is_discontinued_product: productDetails.is_discontinued_product ? 1 : 0,
        comments: productDetails.comments ?? '',
        status: productDetails.status ? 1 : 0,
        sku: productDetails.sku ?? ''
      })
    } else if (open && mode === 'create') {
      setGalleries([])
      form.reset(defaultValues)
    }
  }, [open, productDetails, mode, productId, form])

  useEffect(() => {
    if (!open || mode === 'view' || mode === 'edit') {
      setExactMatches([])

      return
    }

    const checkDuplicate = async () => {
      const query = watchedSku || watchedVendorProductName

      if (!query || !watchedVendorId) {
        setExactMatches([])

        return
      }

      try {
        const response = await NonInventoryProductService.index({ search: query })
        const products = (response.data?.data as Product[]) || []

        const matches = products.filter(p => {
          return (
            p.vendor_id?.toString() === watchedVendorId &&
            (p.sku || '') === (watchedSku || '') &&
            (p.vendor_product_name || '') === (watchedVendorProductName || '') &&
            (p.vendor_style || '') === (watchedVendorStyle || '') &&
            (p.vendor_color || '') === (watchedVendorColor || '')
          )
        })

        setExactMatches(matches)
      } catch (e) {
        // ignore errors
      }
    }

    const timer = setTimeout(checkDuplicate, 500)

    return () => clearTimeout(timer)
  }, [open, mode, watchedVendorId, watchedSku, watchedVendorProductName, watchedVendorStyle, watchedVendorColor])

  const handleApiError = (error: any, fallbackMessage: string) => {
    if (error?.errors && typeof error.errors === 'object') {
      const formValues = form.getValues()

      Object.entries(error.errors).forEach(([field, messages]) => {
        const normalizedField = field.split('.')[0] as keyof FormValues
        const message = Array.isArray(messages) ? String(messages[0]) : String(messages)

        if (normalizedField in formValues) {
          form.setError(normalizedField, { type: 'server', message })
        } else {
          toast.error(message)
        }
      })

      if (error.message) {
        toast.error(error.message)
      }
    } else {
      toast.error(error?.message || fallbackMessage)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if ((mode === 'create' || mode === 'duplicate') && exactMatches.length > 0 && !isDuplicateConfirmOpen) {
      setPendingFormValues(values)
      setIsDuplicateConfirmOpen(true)

      return
    }

    await performSubmit(values)
  }

  const performSubmit = async (values: FormValues) => {
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
      if (mode === 'create' || mode === 'duplicate') {
        await NonInventoryProductService.store(payload)
        toast.success('Non-inventory product created successfully')
        onOpenChange(false)
        onSuccess?.()
        form.reset(defaultValues)
      } else if (mode === 'edit' && productId) {
        await NonInventoryProductService.update(productId, payload)
        toast.success('Non-inventory product updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      handleApiError(error, mode === 'edit' ? 'Failed to update product' : 'Failed to create product')
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
      case 'duplicate':
        return 'Duplicate Non-Inventory Product'
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
      case 'duplicate':
        return 'Duplicate an existing non-inventory product'
      case 'edit':
        return 'Update non-inventory product information'
      case 'view':
        return 'View non-inventory product details'
      default:
        return ''
    }
  }

  const handleGalleryUpdate = () => {
    if (productId) {
      fetchGalleries(productId)
    }
  }

  const fieldStyle = 'grid grid-cols-[116px_minmax(100px,_1fr)]'
  const labelStyle = 'text-xs font-normal leading-tight justify-end items-start self-start text-right pt-1'

  const renderFormField = (field: FormFieldType) => {
    const isHorizontalField = field.type === 'switch' || field.type === 'checkbox'

    return (
      <CustomFormField
        key={field.name}
        {...field}
        register={register}
        control={control}
        errors={errors}
        disabled={mode === 'view'}
        fieldClassName={`${field?.label ? fieldStyle : ''} ${isHorizontalField ? '[&>button]:order-2 [&>label]:order-1' : ''}`}
        labelClassName={labelStyle}
      />
    )
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage={
        mode === 'create' || mode === 'duplicate'
          ? 'Creating non-inventory product...'
          : mode === 'edit'
            ? 'Updating non-inventory product...'
            : 'Loading non-inventory product...'
      }
      open={open}
      onOpenChange={onOpenChange}
      title={getTitle()}
      description={getDescription()}
      className='max-w-380!'
      disableClose={form.formState.isSubmitting}
      actions={
        mode !== 'view' ? (
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onCancel}
              disabled={form.formState.isSubmitting}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              size='sm'
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
              className='flex-1'
            >
              {form.formState.isSubmitting
                ? 'Saving...'
                : mode === 'create' || mode === 'duplicate'
                  ? 'Create'
                  : 'Update'}
            </Button>
          </div>
        ) : (
          <Button type='button' variant='outline' size='sm' onClick={onCancel}>
            Close
          </Button>
        )
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mb-4'>
          <div
            className={`grid grid-cols-1 items-start ${mode === 'create' || mode === 'duplicate' ? 'lg:grid-cols-2' : 'lg:grid-cols-[3fr_3fr_2fr]'} gap-2`}
          >
            {/* Basic Product Information */}
            <div className='sticky top-4 p-4 border border-border rounded-lg'>
              <h3 className='leading-none font-semibold pb-3.5 mb-3 border-b border-border'>Product Information</h3>
              <BasicProductFields
                form={form}
                vendors={vendors}
                productCategories={productCategories}
                serviceTypes={serviceTypes}
                renderFormField={renderFormField}
              />
            </div>

            {/* UOM and Properties */}
            <div className='sticky top-4 p-4 border border-border rounded-lg'>
              <h3 className='leading-none font-semibold pb-3.5 mb-3 border-b border-border'>
                UOM and Other Properties
              </h3>
              <div className='flex flex-col gap-y-2 mt-3'>
                <UOMFields
                  form={form}
                  uomUnits={uomUnits}
                  fieldStyle={fieldStyle}
                  labelStyle={labelStyle}
                  renderFormField={renderFormField}
                />
                <PricingFields
                  form={form}
                  uomUnits={uomUnits}
                  fieldStyle={fieldStyle}
                  labelStyle={labelStyle}
                  renderFormField={renderFormField}
                />
                <AdditionalInfoFields form={form} renderFormField={renderFormField} />
              </div>
            </div>

            {/* Gallery Section - Only show in edit/view mode */}
            {mode !== 'create' && mode !== 'duplicate' && productId && (
              <div className='sticky top-4 space-y-4'>
                <QrCodeSection qrCodePath={productDetails?.qr_code} />
                <BarCodeSection barCodePath={productDetails?.bar_code} />

                <div className='p-4 border border-border rounded-lg'>
                  <h3 className='leading-none font-semibold pb-3.5 mb-3 border-b border-border'>Product Gallery</h3>
                  <ProductGallerySection
                    productId={productId}
                    galleries={galleries}
                    isLoading={isLoadingGalleries}
                    onUpdate={handleGalleryUpdate}
                    disabled={mode === 'view'}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
      <ConfirmDialog
        open={isDuplicateConfirmOpen}
        onOpenChange={setIsDuplicateConfirmOpen}
        className='max-w-3xl'
        title='Add Product?'
        message={
          <div className='flex flex-col gap-4'>
            <p>The product with similar details is already available. Are you sure you want to add the product?</p>
            <div className='border rounded-md overflow-hidden'>
              <table className='w-full text-sm text-left'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 py-2 font-medium'>SKU</th>
                    <th className='px-4 py-2 font-medium'>Product Name</th>
                    <th className='px-4 py-2 font-medium'>Style</th>
                    <th className='px-4 py-2 font-medium'>Color</th>
                  </tr>
                </thead>
                <tbody>
                  {exactMatches.map((match, i) => (
                    <tr key={match.id || i} className='border-t'>
                      <td className='px-4 py-2'>{match.sku || 'N/A'}</td>
                      <td className='px-4 py-2'>{match.vendor_product_name || match.private_product_name || 'N/A'}</td>
                      <td className='px-4 py-2'>{match.vendor_style || match.private_style || 'N/A'}</td>
                      <td className='px-4 py-2'>{match.vendor_color || match.private_color || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
        confirmButtonTitle='Yes'
        cancelButtonTitle='Cancel'
        onConfirm={() => {
          setIsDuplicateConfirmOpen(false)

          if (pendingFormValues) {
            performSubmit(pendingFormValues)
          }
        }}
      />
    </CommonDialog>
  )
}

export default CreateEditViewNonInventoryProductModal
