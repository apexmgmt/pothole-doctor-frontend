'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import { ProductBulkUpdatePayload } from '@/types'
import ProductService from '@/services/api/products/products.service'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import CustomFormField from '@/components/form/CustomFormField'

interface BulkUpdateProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  selectedIds: string[]
  type: 'inventory' | 'non_inventory'
  vendorId?: string | null
  categoryId?: string | null
}

interface FormData {
  margin: string
  product_cost: string
  coverage_per_rate: string
  is_freight_percentage: boolean
  freight_amount: string
  round_up_quantity: 'enable' | 'disable' | ''
  is_discontinued: boolean
  is_update_all_product_for_vendor: boolean
  is_update_all_product_for_category: boolean
}

const BulkUpdateProductModal: React.FC<BulkUpdateProductModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  selectedIds,
  type,
  vendorId,
  categoryId
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const [confirmDialogOptions, setConfirmDialogOptions] = useState<{
    open: boolean
    title: string
    message: string
    confirmButtonTitle?: string
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    message: '',
    confirmButtonTitle: 'Confirm',
    onConfirm: () => {}
  })

  const form = useForm<FormData>({
    defaultValues: {
      margin: '',
      product_cost: '',
      coverage_per_rate: '',
      is_freight_percentage: true,
      freight_amount: '',
      round_up_quantity: '',
      is_discontinued: false,
      is_update_all_product_for_vendor: false,
      is_update_all_product_for_category: false
    }
  })

  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    setValue,
    formState: { isSubmitting, dirtyFields, errors }
  } = form

  const isFreightPercentage = watch('is_freight_percentage')

  useEffect(() => {
    if (open) {
      reset({
        margin: '',
        product_cost: '',
        coverage_per_rate: '',
        is_freight_percentage: true,
        freight_amount: '',
        round_up_quantity: '',
        is_discontinued: false,
        is_update_all_product_for_vendor: false,
        is_update_all_product_for_category: false
      })
    }
  }, [open, reset])

  const onSubmit = async (data: FormData) => {
    if (data.is_update_all_product_for_vendor || data.is_update_all_product_for_category) {
      setConfirmDialogOptions({
        open: true,
        title: 'Confirm Bulk Update',
        message:
          'Are you sure you want to update all products for the selected vendor or category? This could affect many products.',
        confirmButtonTitle: 'Confirm',
        onConfirm: () => {
          setConfirmDialogOptions(prev => ({ ...prev, open: false }))
          executeSubmit(data)
        }
      })

      return
    }

    executeSubmit(data)
  }

  const executeSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const changes: any = {}

      if (dirtyFields.margin && data.margin !== '') changes.margin = parseFloat(data.margin)
      if (dirtyFields.product_cost && data.product_cost !== '') changes.product_cost = parseFloat(data.product_cost)
      if (dirtyFields.coverage_per_rate && data.coverage_per_rate !== '')
        changes.coverage_per_rate = parseFloat(data.coverage_per_rate)

      if (data.freight_amount !== '') {
        changes.freight_amount = parseFloat(data.freight_amount)
        changes.is_freight_percentage = data.is_freight_percentage
      }

      if (dirtyFields.round_up_quantity && data.round_up_quantity !== '') {
        changes.round_up_quantity = data.round_up_quantity === 'enable'
      }

      if (dirtyFields.is_discontinued) {
        changes.status = !data.is_discontinued
      }

      if (dirtyFields.is_update_all_product_for_vendor && data.is_update_all_product_for_vendor) {
        changes.is_update_all_product_for_vendor = true
      }

      if (dirtyFields.is_update_all_product_for_category && data.is_update_all_product_for_category) {
        changes.is_update_all_product_for_category = true
      }

      // If no changes, just close
      if (Object.keys(changes).length === 0) {
        toast.info('No changes made.')
        onOpenChange(false)
        setIsLoading(false)

        return
      }

      const payload: ProductBulkUpdatePayload = {
        ids: selectedIds,
        changes
      }

      if (data.is_update_all_product_for_vendor && vendorId) {
        payload.vendor_id = vendorId
      }

      if (data.is_update_all_product_for_category && categoryId) {
        payload.category_id = categoryId
      }

      if (type === 'inventory') {
        await ProductService.bulkUpdate(payload)
      } else {
        await NonInventoryProductService.bulkUpdate(payload)
      }

      toast.success('Products bulk updated successfully')
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to bulk update products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVendorCheckboxChange = (checked: any) => {
    if (checked) {
      if (!vendorId) {
        setConfirmDialogOptions({
          open: true,
          title: 'Vendor Filter Required',
          message: 'Please filter by a specific vendor first.',
          confirmButtonTitle: 'Okay',
          onConfirm: () => setConfirmDialogOptions(prev => ({ ...prev, open: false }))
        })
        setTimeout(() => {
          setValue('is_update_all_product_for_vendor', false)
        }, 0)

        return
      }
    }
  }

  const handleCategoryCheckboxChange = (checked: any) => {
    if (checked) {
      if (!categoryId) {
        setConfirmDialogOptions({
          open: true,
          title: 'Category Filter Required',
          message: 'Please filter by a specific category first.',
          confirmButtonTitle: 'Okay',
          onConfirm: () => setConfirmDialogOptions(prev => ({ ...prev, open: false }))
        })
        setTimeout(() => {
          setValue('is_update_all_product_for_category', false)
        }, 0)

        return
      }
    }
  }

  const fieldStyle = 'grid grid-cols-[200px_minmax(200px,_1fr)] items-center'
  const labelStyle = 'justify-end text-right pr-4 text-xs font-medium '

  return (
    <>
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title='Bulk Update'
        disableClose={isSubmitting || isLoading}
        className='sm:max-w-2xl'
        actions={
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button type='submit' size='sm' onClick={handleSubmit(onSubmit)} disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-4 flex flex-col items-center'>
            <div className='w-full max-w-lg space-y-4'>
              <CustomFormField
                name='margin'
                type='number'
                label='Margin (%)'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                rules={{
                  validate: value => {
                    if (value === '') return true
                    const num = parseFloat(value as string)

                    if (isNaN(num)) return 'Must be a number'
                    if (num < 0 || num > 100) return 'Margin must be between 0 and 100'

                    return true
                  }
                }}
              />

              <CustomFormField
                name='product_cost'
                type='number'
                label='Unit Cost'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='coverage_per_rate'
                type='number'
                label='Coverage'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='is_freight_percentage'
                type='switch'
                label='Freight Percentage?'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='freight_amount'
                type='number'
                label='Freight Amount'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
                rules={{
                  validate: value => {
                    if (value === '') return true
                    const num = parseFloat(value as string)

                    if (isNaN(num)) return 'Must be a number'

                    if (isFreightPercentage && (num < 0 || num > 100)) {
                      return 'Freight percentage must be between 0 and 100'
                    }

                    return true
                  }
                }}
              />

              <CustomFormField
                name='round_up_quantity'
                type='radio'
                label='Round Up Quantity'
                selectOptions={[
                  { label: 'Enable', value: 'enable' },
                  { label: 'Disable', value: 'disable' }
                ]}
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='is_discontinued'
                type='checkbox'
                label='Mark Products As Discontinued'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='is_update_all_product_for_vendor'
                type='checkbox'
                label='Update All Products For Vendor'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
                onChange={handleVendorCheckboxChange}
              />

              <CustomFormField
                name='is_update_all_product_for_category'
                type='checkbox'
                label='Update All Products For Category'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
                onChange={handleCategoryCheckboxChange}
              />
            </div>
          </form>
        </Form>
      </CommonDialog>

      <ConfirmDialog
        open={confirmDialogOptions.open}
        onOpenChange={open => setConfirmDialogOptions(prev => ({ ...prev, open }))}
        title={confirmDialogOptions.title}
        message={confirmDialogOptions.message}
        onConfirm={confirmDialogOptions.onConfirm}
        confirmButtonTitle={confirmDialogOptions.confirmButtonTitle || 'Confirm'}
      />
    </>
  )
}

export default BulkUpdateProductModal
