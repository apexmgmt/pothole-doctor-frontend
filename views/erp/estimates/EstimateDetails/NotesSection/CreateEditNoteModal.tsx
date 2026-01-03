import React, { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { EstimateNote, EstimateNotePayload } from '@/types'
import EstimateNoteService from '@/services/api/estimates/estimate-notes.service'

interface CreteEditNoteModalProps {
  mode?: 'create' | 'edit'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  estimateId: string
  note?: EstimateNote | null
  note_id?: string | null
  onSuccess?: () => void
}

const CreteEditNoteModal: React.FC<CreteEditNoteModalProps> = ({
  mode = 'create',
  isOpen,
  onOpenChange,
  estimateId,
  note,
  note_id,
  onSuccess
}) => {
  const form = useForm<EstimateNotePayload>({
    defaultValues: {
      estimate_id: estimateId,
      comment: note?.comment || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        estimate_id: estimateId,
        comment: note?.comment || ''
      })
    }
  }, [isOpen, note, estimateId, form])

  const onSubmit = async (values: EstimateNotePayload) => {
    try {
      if (mode === 'edit' && note_id) {
        await EstimateNoteService.update(note_id, values)
        toast.success('Note updated successfully')
      } else {
        await EstimateNoteService.store(values)
        toast.success('Note created successfully')
      }

      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save note')
    }
  }

  const onCancel = () => {
    form.reset({
      estimate_id: estimateId,
      comment: note?.comment || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={mode === 'edit' ? 'Edit Note' : 'Add Note'}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
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
                <FormLabel>
                  Comment <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder='Type your note here...' {...field} />
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

export default CreteEditNoteModal
