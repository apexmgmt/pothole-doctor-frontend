'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { PaymentTermType, PaymentTerm, PaymentTermPayload } from '@/types'

import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import CustomFormField from '@/components/form/CustomFormField'
import { Separator } from '@/components/ui/separator'

interface CreateOrEditPaymentTermModalProps {
  mode?: 'create' | 'edit'
  paymentTermTypes: PaymentTermType[] | []
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentTermId?: string
  paymentTermDetails?: PaymentTerm
  onSuccess?: () => void
}

interface FormValues {
  name: string
  type: string
  due_time: string
}

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
    setIsLoading(true)

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
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
            form.reset()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create payment term')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while creating the payment term!')
        setIsLoading(false)
      }
    } else if (mode === 'edit' && paymentTermId) {
      try {
        await PaymentTermsService.update(paymentTermId, payload)
          .then(response => {
            toast.success('Payment term updated successfully')
            onOpenChange(false)
            onSuccess?.()
            setIsLoading(false)
            form.reset()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update payment term')
            setIsLoading(false)
          })
      } catch (error) {
        toast.error('Something went wrong while updating the payment term!')
        setIsLoading(false)
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

  const fieldStyle = 'grid grid-cols-[152px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  const {
    register,
    control,
    formState: { errors }
  } = form

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading payment terms...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Payment Term' : 'Edit Payment Term'}
      description={mode === 'create' ? 'Add a new payment term to the system' : 'Update payment term information'}
      maxWidth='5xl'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={form.handleSubmit(onSubmit)} disabled={isLoading} className='flex-1'>
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            <CustomFormField
              name='name'
              label='Name'
              placeholder='Enter payment term name'
              rules={{
                required: 'Payment term name must be at least 2 characters',
                minLength: { value: 2, message: 'Payment term name must be at least 2 characters' }
              }}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {selectedType && (
              <CustomFormField
                name='due_time'
                label={getDueTimeLabel()}
                type='number'
                placeholder={`Enter ${getDueTimeLabel().toLowerCase()}`}
                rules={{ required: `${getDueTimeLabel()} is required` }}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            )}
          </div>

          <Separator />

          <div className=''>
            <CustomFormField
              name='type'
              label='Payment Term Type'
              type='radio'
              rules={{ required: 'Please select a payment term type' }}
              selectOptions={paymentTermTypes.map(type => ({
                label: type.name,
                value: type.type
              }))}
              control={control}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
              className='flex-col'
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditPaymentTermModal
