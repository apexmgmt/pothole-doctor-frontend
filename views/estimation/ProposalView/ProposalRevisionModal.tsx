import React, { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

interface ProposalRevisionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  onSuccess?: () => void
}

const ProposalRevisionModal: React.FC<ProposalRevisionModalProps> = ({
  isOpen,
  onOpenChange,
  proposalId,   
  onSuccess
}) => {
  const form = useForm<{proposal_id: string, comment: string}>({
    defaultValues: {
      proposal_id: proposalId,
      comment: ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        proposal_id: proposalId,
        comment: ''
      })
    }
  }, [isOpen, form])

  const onSubmit = async (values: {proposal_id: string, comment: string}) => {
    try {
      // Api call to submit the revision request
    console.log('Submitting proposal revision request:', values)
      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to send revision request')
    }
  }

  const onCancel = () => {
    form.reset({
      proposal_id: proposalId,
      comment: ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title='Suggest Revision'
      description='Please let us know what changes we can make to better improve our services.'
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
            disabled={form.formState.isSubmitting || !form.watch('comment')}
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
            name='comment'
            rules={{ required: 'Comment is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-white'>
                  Comment <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Textarea className='text-white' rows={4} placeholder='Type your note here...' {...field} />
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

export default ProposalRevisionModal
