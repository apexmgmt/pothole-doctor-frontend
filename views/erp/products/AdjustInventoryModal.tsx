'use client'

import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Product, PurchaseOrder } from '@/types'
import InventoryService from '@/services/api/products/inventories.service'

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

  const displayField = (label: string, value: string | number | null | undefined) => (
    <div className='flex flex-col gap-1'>
      <span className='text-xs text-muted-foreground'>{label}</span>
      <span className='text-sm font-medium rounded-md px-3 py-2 bg-muted min-h-9'>{value ?? '—'}</span>
    </div>
  )

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
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' form='adjustment-form' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form id='adjustment-form' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            {/* Left column */}
            <div className='space-y-4'>
              {displayField('PO#', `PO-${inventory.purchase_order_number}`)}

              <FormField
                control={form.control}
                name='adjustment_type'
                rules={{ required: 'Adjustment type is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Adjustment Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='addition'>Addition</SelectItem>
                        <SelectItem value='reduction'>Reduction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Right column */}
            <div className='space-y-4'>
              {displayField('Available Quantity', `${availableQty} ${unitName}`)}

              <FormField
                control={form.control}
                name='quantity'
                rules={{ required: 'Quantity is required', min: { value: 1, message: 'Must be ≥ 1' } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Qty to Adjust <span className='text-destructive'>*</span>
                    </FormLabel>
                    <div className='flex items-center gap-2'>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          min={1}
                          {...field}
                          onChange={e => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <span className='text-sm text-muted-foreground whitespace-nowrap'>{unitName}</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='col-span-2'>
              <FormField
                control={form.control}
                name='reason'
                rules={{ required: 'Comments is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Comments <span className='text-destructive'>*</span>
                    </FormLabel>
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
        </form>
      </Form>
    </CommonDialog>
  )
}

export default AdjustInventoryModal
