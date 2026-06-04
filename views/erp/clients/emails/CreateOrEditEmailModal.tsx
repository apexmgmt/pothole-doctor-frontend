import React, { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CustomFormField from '@/components/form/CustomFormField'
import { Client } from '@/types'

import TipTapRichTextEditor from '@/components/erp/common/editor/TipTapRichTextEditor'
import ClientEmailService from '@/services/api/clients/client-emails.service'

interface EmailFormValues {
  client_id: string
  subject: string
  source: string
  message: string
  cc_email: string
}

const CreateOrEditEmailModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clientId: string
  client: Client | null
  onSuccess: () => void
}> = ({ isOpen, onClose, clientId, client, onSuccess }) => {
  const [messageHtml, setMessageHtml] = useState('')

  const form = useForm<EmailFormValues>({
    defaultValues: {
      client_id: clientId,
      subject: '',
      source: client?.email || '',
      message: '',
      cc_email: client?.clientable?.cc_email || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_id: clientId,
        subject: '',
        source: client?.email || '',
        message: '',
        cc_email: client?.clientable?.cc_email || ''
      })
      setMessageHtml('')
    }
  }, [isOpen, client, clientId, form])

  const onSubmit = async (values: EmailFormValues) => {
    try {
      const message = messageHtml

      await ClientEmailService.store({ ...values, message })
      toast.success('Email sent successfully')
      form.reset()
      setMessageHtml('')
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to send email')
    }
  }

  const onCancel = () => {
    form.reset()
    setMessageHtml('')
    onClose()
  }

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title='Send Email'
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
            disabled={form.formState.isSubmitting}
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
            type='email'
            register={form.register}
            name='source'
            label='To'
            placeholder='Recipient email'
            rules={{ required: 'Recipient email is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='email'
            register={form.register}
            name='cc_email'
            label='CC Email'
            placeholder='CC Email'
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='text'
            register={form.register}
            name='subject'
            label='Subject'
            placeholder='Email subject'
            rules={{ required: 'Subject is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <div className='space-y-2 grid gap-2 grid-cols-[100px_minmax(0,_1fr)]'>
            <label
              className='text-sm font-medium 
justify-end self-start text-right pt-1'
            >
              Message <span className='text-red-500'>*</span>
            </label>
            <TipTapRichTextEditor
              value={messageHtml}
              onChange={setMessageHtml}
              placeholder='Type your message here...'
              disabled={form.formState.isSubmitting}
            />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditEmailModal
