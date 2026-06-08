'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { VendorRebateCredit, VendorRebateCreditPayload } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import CustomFormField from '@/components/form/CustomFormField'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import VendorRebateCreditService from '@/services/api/vendors/vendor-rebate-credits.service'

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

  const {
    reset,
    setError,
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

  useEffect(() => {
    if (open) {
      reset({
        amount: rebateCreditDetails?.amount ?? 0,
        date: rebateCreditDetails?.date ?? '',
        reference: rebateCreditDetails?.reference ?? '',
        note: rebateCreditDetails?.note ?? ''
      })
    }
  }, [rebateCreditDetails, open, reset])

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
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && rebateCreditId) {
        await VendorRebateCreditService.update(rebateCreditId, payload)
        toast.success('Rebate credit updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      const serverErrors = error?.errors || {}

      if (serverErrors && typeof serverErrors === 'object') {
        Object.entries(serverErrors).forEach(([field, messages]) => {
          const errMessage = (messages as string[])?.[0]

          setError(field as keyof FormValues, {
            type: 'server',
            message: typeof errMessage === 'string' ? errMessage : ''
          })
        })
      }

      toast.error(error?.message || 'Failed to save rebate credit')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    reset()
    onOpenChange(false)
  }

  const fieldStyle = 'grid grid-cols-[104px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Processing rebate credit...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Rebate Credit' : 'Edit Rebate Credit'}
      description={mode === 'create' ? 'Add a new rebate credit for this vendor.' : 'Update rebate credit details.'}
      maxWidth='xl'
      disableClose={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button type='submit' size='sm' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-x-4 gap-y-2'>
          <CustomFormField
            name='reference'
            label='Reference'
            placeholder='Enter reference'
            rules={{
              required: 'Reference is required',
              minLength: { value: 2, message: 'Reference must be at least 2 characters' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='amount'
            label='Amount'
            type='number'
            placeholder='Enter amount'
            rules={{
              required: 'Amount is required',
              min: { value: 0, message: 'Amount must be at least 0' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='date'
            label='Date'
            type='datepicker'
            placeholder='Select date'
            rules={{
              required: 'Date is required'
            }}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='note'
            label='Note'
            type='textarea'
            placeholder='Enter note (optional)'
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditRebateCreditModal
