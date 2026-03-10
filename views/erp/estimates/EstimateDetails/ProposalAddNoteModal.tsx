'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { NoteType, ClientNotePayload } from '@/types'
import NoteTypeService from '@/services/api/settings/note_types.service'
import ProposalNoteService from '@/services/api/estimates/proposal-notes.service'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { SpinnerCustom } from '@/components/ui/spinner'

interface ProposalAddNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  clientId?: string
  mode?: 'create' | 'edit'
  noteId?: string
  noteDetails?: any
  onSuccess?: () => void
}

const ProposalAddNoteModal = ({
  open,
  onOpenChange,
  proposalId,
  clientId,
  mode = 'create',
  noteId,
  noteDetails,
  onSuccess
}: ProposalAddNoteModalProps) => {
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  const form = useForm<ClientNotePayload>({
    defaultValues: {
      client_id: clientId || noteDetails?.client_id || '',
      note_type_id: noteDetails?.note_type_id || '',
      subject: noteDetails?.subject || '',
      comment: noteDetails?.comment || ''
    }
  })

  // Fetch note types once when modal first opens
  useEffect(() => {
    if (!open || hasFetched) return

    const fetchAll = async () => {
      setIsFetching(true)

      try {
        const res = await NoteTypeService.getAll()

        setNoteTypes(res.data || [])
      } catch {
        // silently handle
      } finally {
        setIsFetching(false)
        setHasFetched(true)
      }
    }

    fetchAll()
  }, [open, hasFetched])

  // Reset form when modal opens/details change
  useEffect(() => {
    if (open) {
      form.reset({
        client_id: clientId || noteDetails?.client_id || '',
        note_type_id: noteDetails?.note_type_id || '',
        subject: noteDetails?.subject || '',
        comment: noteDetails?.comment || ''
      })
    }
  }, [open, noteDetails, clientId])

  const onSubmit = async (values: ClientNotePayload) => {
    try {
      if (mode === 'edit' && noteId) {
        await ProposalNoteService.update(proposalId, noteId, values)
        toast.success('Note updated successfully')
      } else {
        await ProposalNoteService.store(proposalId, values)
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
    form.reset()
    onOpenChange(false)
  }

  const title = mode === 'edit' ? 'Edit Note' : 'Add Note'

  // Show loading dialog while fetching note types
  if (isFetching || (open && !hasFetched)) {
    return (
      <CommonDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description='Loading note data...'
        maxWidth='xl'
      >
        <div className='flex items-center justify-center py-12'>
          <SpinnerCustom size='size-8' />
        </div>
      </CommonDialog>
    )
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title={title}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
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

export default ProposalAddNoteModal
