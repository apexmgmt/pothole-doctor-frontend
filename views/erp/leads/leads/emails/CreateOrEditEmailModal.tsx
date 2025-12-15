import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import LeadEmailService from '@/services/api/leads/lead-emails.service'
import { toast } from 'sonner'
import { Lead } from '@/types'
import { Descendant } from 'slate'
import RichTextEditor, { serializeToHtml } from '@/components/erp/common/editor/RichTextEditor'

interface EmailFormValues {
  client_id: string
  subject: string
  source: string
  message: string
  cc_email: string
}

const initialValue: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }]

const CreateOrEditEmailModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clientId: string
  lead: Lead | null
  onSuccess: () => void
}> = ({ isOpen, onClose, clientId, lead, onSuccess }) => {
  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue)

  const form = useForm<EmailFormValues>({
    defaultValues: {
      client_id: clientId,
      subject: '',
      source: lead?.client?.email || '',
      message: '',
      cc_email: lead?.cc_email || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_id: clientId,
        subject: '',
        source: lead?.client?.email || '',
        message: '',
        cc_email: lead?.cc_email || ''
      })
      setEditorValue(initialValue)
    }
  }, [isOpen, lead, clientId, form])

  const onSubmit = async (values: EmailFormValues) => {
    try {
      const message = serializeToHtml(editorValue)
      await LeadEmailService.store({ ...values, message })
      toast.success('Email sent successfully')
      form.reset()
      setEditorValue(initialValue)
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to send email')
    }
  }

  const onCancel = () => {
    form.reset()
    setEditorValue(initialValue)
    onClose()
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title='Send Email'
      maxWidth='4xl'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='source'
            rules={{ required: 'Recipient email is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  To <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Recipient email' type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cc_email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>CC Email</FormLabel>
                <FormControl>
                  <Input placeholder='CC Email' type='email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='subject'
            rules={{ required: 'Subject is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Subject <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Email subject' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              Message <span className='text-red-500'>*</span>
            </label>
            <RichTextEditor value={editorValue} onChange={setEditorValue} placeholder='Type your message here...' />
          </div>
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditEmailModal
