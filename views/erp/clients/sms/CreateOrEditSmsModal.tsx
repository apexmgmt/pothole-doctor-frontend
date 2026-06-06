import React, { useEffect } from 'react'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CustomFormField from '@/components/form/CustomFormField'
import { Client } from '@/types'
import ClientSmsService from '@/services/api/clients/client-sms.service'

interface SmsFormValues {
  to: string
  message: string
}

const CreateOrEditSmsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clientId: string
  client: Client | null
  onSuccess: () => void
}> = ({ isOpen, onClose, clientId, client, onSuccess }) => {
  const form = useForm<SmsFormValues>({
    defaultValues: {
      to: client?.clientable?.cell_phone || '',
      message: ''
    }
  })

  // Reset form when modal opens or lead changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        to: client?.clientable?.cell_phone || '',
        message: ''
      })
    }
  }, [isOpen, client, form])

  const onSubmit = async (values: SmsFormValues) => {
    try {
      await ClientSmsService.store({ client_id: clientId, ...values })
      toast.success('SMS sent successfully')
      form.reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to send SMS')
    }
  }

  const onCancel = () => {
    form.reset({
      to: client?.clientable?.cell_phone || '',
      message: ''
    })
    onClose()
  }

  const fieldStyle = 'grid grid-cols-[72px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title='Send text message'
      maxWidth='xl'
      isLoading={form.formState.isSubmitting}
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
            disabled={form.formState.isSubmitting || !form.watch('to') || !form.watch('message')}
            className='flex-1'
          >
            {form.formState.isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <CustomFormField
            type='text'
            register={form.register}
            name='to'
            label='To'
            placeholder='Recipient phone number'
            rules={{ required: 'Recipient phone number is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='textarea'
            register={form.register}
            name='message'
            label='Message'
            placeholder='Type your message here...'
            rules={{ required: 'Message is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditSmsModal
