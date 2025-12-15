import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import LeadNoteService from '@/services/api/leads/lead-notes.service'
import { toast } from 'sonner'
import { LeadNote, LeadNotePayload, NoteType } from '@/types'

interface CreateOrEditNoteModalProps {
  mode?: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  clientId: string
  noteTypes: NoteType[]
  note?: LeadNote | null
  note_id?: string | null
  onSuccess: () => void
}

const CreateOrEditNoteModal: React.FC<CreateOrEditNoteModalProps> = ({
  mode = 'create',
  isOpen,
  onClose,
  clientId,
  noteTypes,
  note,
  note_id,
  onSuccess
}) => {
  const form = useForm<LeadNotePayload>({
    defaultValues: {
      client_id: clientId,
      note_type_id: note?.note_type_id || '',
      subject: note?.subject || '',
      comment: note?.comment || ''
    }
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        client_id: clientId,
        note_type_id: note?.note_type_id || '',
        subject: note?.subject || '',
        comment: note?.comment || ''
      })
    }
  }, [isOpen, note, clientId, form])

  const onSubmit = async (values: LeadNotePayload) => {
    try {
      if (mode === 'edit' && note_id) {
        await LeadNoteService.update(note_id, values)
        toast.success('Note updated successfully')
      } else {
        await LeadNoteService.store(values)
        toast.success('Note created successfully')
      }
      form.reset()
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save note')
    }
  }

  const onCancel = () => {
    form.reset({
      client_id: clientId,
      note_type_id: note?.note_type_id || '',
      subject: note?.subject || '',
      comment: note?.comment || ''
    })
    onClose()
  }

  return (
    <CommonDialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
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
            disabled={
              form.formState.isSubmitting ||
              !form.watch('note_type_id') ||
              !form.watch('subject') ||
              !form.watch('comment')
            }
            className='flex-1'
          >
            {form.formState.isSubmitting
              ? 'Saving...'
              : mode === 'edit'
                ? 'Update'
                : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='note_type_id'
            rules={{ required: 'Note type is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Note Type <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange} disabled={form.formState.isSubmitting}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select note type' />
                    </SelectTrigger>
                    <SelectContent>
                      {noteTypes.map(nt => (
                        <SelectItem key={nt.id} value={nt.id}>
                          {nt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Input placeholder='Subject' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

export default CreateOrEditNoteModal
