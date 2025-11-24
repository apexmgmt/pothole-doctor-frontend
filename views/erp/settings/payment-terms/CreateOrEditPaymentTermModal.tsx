'use client'

import { PaymentTermType, PaymentTerm, PaymentTermPayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'

interface CreateOrEditPaymentTermModalProps {
  mode?: 'create' | 'edit'
  paymentTermTypes: PaymentTermType[] | []
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentTermId?: string
  paymentTermDetails?: PaymentTerm
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Payment term name must be at least 2 characters' }),
  type: z.string().min(1, { message: 'Please select a payment term type' }),
  due_time: z.string().min(1, { message: 'This field is required' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditPaymentTermModal = ({
  mode = 'create',
  open,
  paymentTermTypes,
  onOpenChange,
  paymentTermId,
  paymentTermDetails,
  onSuccess
}: CreateOrEditPaymentTermModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: paymentTermDetails?.name || '',
      type: paymentTermDetails?.type || 'day',
      due_time: paymentTermDetails?.due_time?.toString() || ''
    }
  })

  // Watch type to change label dynamically
  const selectedType = form.watch('type')

  // Get the label for due_time field based on selected type
  const getDueTimeLabel = () => {
    if (selectedType === 'day') return 'Due Days'
    if (selectedType === 'month') return 'Day of the Month'
    return 'Due Time'
  }

  // Reset form when paymentTermDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: paymentTermDetails?.name || '',
        type: paymentTermDetails?.type || 'day',
        due_time: paymentTermDetails?.due_time?.toString() || ''
      })
    }
  }, [paymentTermDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: PaymentTermPayload = {
      name: values.name,
      type: values.type,
      status: 1,
      due_time: parseInt(values.due_time)
    }

    if (mode === 'create') {
      try {
        await PaymentTermsService.store(payload)
          .then(response => {
            toast.success('Payment term created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create payment term')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the payment term!')
      }
    } else if (mode === 'edit' && paymentTermId) {
      try {
        await PaymentTermsService.update(paymentTermId, payload)
          .then(response => {
            toast.success('Payment term updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update payment term')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the payment term!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: paymentTermDetails?.name || '',
      type: paymentTermDetails?.type || 'day',
      due_time: paymentTermDetails?.due_time?.toString() || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading payment terms...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Payment Term' : 'Edit Payment Term'}
      description={mode === 'create' ? 'Add a new payment term to the system' : 'Update payment term information'}
      maxWidth='xl'
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
          {/* Payment Term Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter payment term name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Term Type Radio Group */}
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Term Type</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className='space-y-2'>
                    {paymentTermTypes.map(type => (
                      <div key={type.id} className='flex items-center space-x-2'>
                        <RadioGroupItem value={type.type} id={type.id} />
                        <Label htmlFor={type.id} className='cursor-pointer'>
                          {type.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Time Field - Label changes based on type */}
          {selectedType && (
            <FormField
              control={form.control}
              name='due_time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getDueTimeLabel()}</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder={`Enter ${getDueTimeLabel().toLowerCase()}`} {...field} min='1' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPaymentTermModal
