'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Product, PurchaseOrder } from '@/types'
import InventoryService from '@/services/api/products/inventories.service'
import { cn } from '@/lib/utils'
import CustomFormField from '@/components/form/CustomFormField'

interface FormValues {
  adjustment_type: 'addition' | 'reduction'
  quantity: number | string
  reason: string
}

interface AdjustInventoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  inventory: PurchaseOrder
  product: Product
}

const AdjustInventoryModal = ({ open, onOpenChange, onSuccess, inventory, product }: AdjustInventoryModalProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const purchaseProduct = inventory.purchase_products?.[0]
  const availableQty = purchaseProduct?.quantity ?? 0
  const unitName = product.purchase_unit?.name ?? product.purchase_uom?.name ?? 'Each(s)'

  const form = useForm<FormValues>({
    defaultValues: {
      adjustment_type: 'addition',
      quantity: '',
      reason: ''
    }
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    const absQty = Number(values.quantity)
    const signedQty = values.adjustment_type === 'reduction' ? -absQty : absQty

    try {
      await InventoryService.createAdjustmentForInventory(inventory.id, {
        quantity: signedQty,
        reason: values.reason
      })
      toast.success('Adjustment created successfully')
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

  const displayField = (label: string, value: string | number | null | undefined, index: number) => {
    const borderClass = index === 0 ? 'border-l-0 pl-0' : 'border-l border-border pl-3'

    return (
      <div key={`${label}-${index}`} className={cn('flex flex-col gap-1.25', borderClass)}>
        <span className='text-xs text-muted-foreground font-normal leading-none'>{label}</span>
        <span className='text-[13px] font-medium leading-tight'>{value ?? '-'}</span>
      </div>
    )
  }

  const fieldStyle = 'grid grid-cols-[108px_minmax(0,_1fr)] gap-2'
  const labelStyle = 'justify-end items-start self-start text-right pt-1.5'

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Add Inventory Adjustment'
      description=''
      maxWidth='2xl'
      isLoading={isLoading}
      loadingMessage='Creating adjustment...'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' size='sm' form='adjustment-form' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='adjustment-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Display Fields */}
          <div className='p-2.5 bg-[#1F1F1F] rounded-lg grid grid-cols-2 gap-x-3 gap-y-6'>
            {[
              { label: 'PO#', value: `PO-${inventory.purchase_order_number}` },
              { label: 'Available Quantity', value: `${availableQty} ${unitName}` }
            ].map((field, idx) => displayField(field.label, field.value, idx))}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2'>
            <CustomFormField
              name='adjustment_type'
              label='Adjustment Type'
              type='select'
              placeholder='Select type'
              rules={{ required: 'Adjustment type is required' }}
              selectOptions={[
                { value: 'addition', label: 'Addition' },
                { value: 'reduction', label: 'Reduction' }
              ]}
              control={form.control}
              errors={form.formState.errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            <div className='flex items-start gap-1.5'>
              <CustomFormField
                name='quantity'
                label='Qty to Adjust'
                type='number'
                rules={{ required: 'Quantity is required', min: { value: 1, message: 'Must be ≥ 1' } }}
                register={form.register}
                errors={form.formState.errors}
                fieldClassName={`${fieldStyle} flex-1`}
                labelClassName={labelStyle}
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap pt-2'>{unitName}</span>
            </div>

            <CustomFormField
              name='reason'
              label='Comments'
              type='textarea'
              placeholder='Comments...'
              rules={{ required: 'Comments is required' }}
              register={form.register}
              errors={form.formState.errors}
              fieldClassName={`sm:col-span-2 ${fieldStyle}`}
              labelClassName={labelStyle}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AdjustInventoryModal
