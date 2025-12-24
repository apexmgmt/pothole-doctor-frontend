'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { VendorRebateCredit, VendorRebateCreditPayload } from '@/types'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import VendorRebateCreditService from '@/services/api/vendors/vendor-rebate-credits.service'
import { DatePicker } from '@/components/ui/datePicker'

interface CreateOrEditRebateCreditModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  rebateCreditId?: string
  rebateCreditDetails?: VendorRebateCredit
  onSuccess?: () => void
}

interface FormValues {
  amount: number
  date: string
  reference: string
  note: string
}

const CreateOrEditRebateCreditModal = ({
  mode = 'create',
  open,
  onOpenChange,
  vendorId,
  rebateCreditId,
  rebateCreditDetails,
  onSuccess
}: CreateOrEditRebateCreditModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      amount: rebateCreditDetails?.amount ?? 0,
      date: rebateCreditDetails?.date ?? '',
      reference: rebateCreditDetails?.reference ?? '',
      note: rebateCreditDetails?.note ?? ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        amount: rebateCreditDetails?.amount ?? 0,
        date: rebateCreditDetails?.date ?? '',
        reference: rebateCreditDetails?.reference ?? '',
        note: rebateCreditDetails?.note ?? ''
      })
    }
  }, [rebateCreditDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    const payload: VendorRebateCreditPayload = {
      vendor_id: vendorId,
      amount: values.amount,
      date: values.date,
      reference: values.reference,
      note: values.note
    }

    try {
      if (mode === 'create') {
        await VendorRebateCreditService.store(payload)
        toast.success('Rebate credit added successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && rebateCreditId) {
        await VendorRebateCreditService.update(rebateCreditId, payload)
        toast.success('Rebate credit updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save rebate credit')
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
      loadingMessage='Processing rebate credit...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Rebate Credit' : 'Edit Rebate Credit'}
      description={mode === 'create' ? 'Add a new rebate credit for this vendor.' : 'Update rebate credit details.'}
      maxWidth='sm'
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='amount'
            rules={{
              required: 'Amount is required',
              min: { value: 0, message: 'Amount must be at least 0' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Amount <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='number' min={0} step={0.01} placeholder='Enter amount' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='date'
            rules={{
              required: 'Date is required'
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value ? new Date(field.value) : null}
                    onChange={val => {
                      // val is a Date or null
                      field.onChange(val ? val.toISOString().slice(0, 10) : '')
                    }}
                    placeholder='Select date'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='reference'
            rules={{
              required: 'Reference is required',
              minLength: { value: 2, message: 'Reference must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Reference <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter reference' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='note'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Input placeholder='Enter note (optional)' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditRebateCreditModal
