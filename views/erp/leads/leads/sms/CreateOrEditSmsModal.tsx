import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import LeadSmsService from '@/services/api/leads/lead-sms.service'
import { toast } from 'sonner'
import { Lead } from '@/types'

interface SmsFormValues {
  to: string
  message: string
}

const CreateOrEditSmsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clientId: string
  lead: Lead | null
  onSuccess: () => void
}> = ({ isOpen, onClose, clientId, lead, onSuccess }) => {
  const form = useForm<SmsFormValues>({
    defaultValues: {
      to: lead?.cell_phone || '',
      message: ''
    }
  })

  // Reset form when modal opens or lead changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        to: lead?.cell_phone || '',
        message: ''
      })
    }
  }, [isOpen, lead, form])

  const onSubmit = async (values: SmsFormValues) => {
    try {
      await LeadSmsService.store({ client_id: clientId, ...values })
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
      to: lead?.cell_phone || '',
      message: ''
    })
    onClose()
  }

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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='to'
            rules={{ required: 'Recipient phone number is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  To <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Recipient phone number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='message'
            rules={{ required: 'Message is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Message <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder='Type your message here...' {...field} />
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

export default CreateOrEditSmsModal
