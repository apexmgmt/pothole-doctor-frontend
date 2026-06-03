import React, { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CustomFormField from '@/components/form/CustomFormField'
import { ClientNote, ClientNotePayload, NoteType } from '@/types'
import ClientNoteService from '@/services/api/clients/client-notes.service'

interface CreateOrEditNoteModalProps {
  mode?: 'create' | 'edit'
  isOpen: boolean
  onClose: () => void
  clientId: string
  noteTypes: NoteType[]
  note?: ClientNote | null
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
  const form = useForm<ClientNotePayload>({
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

  const onSubmit = async (values: ClientNotePayload) => {
    try {
      if (mode === 'edit' && note_id) {
        await ClientNoteService.update(note_id, values)
        toast.success('Note updated successfully')
      } else {
        await ClientNoteService.store(values)
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

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <CustomFormField
            type='select'
            control={form.control}
            name='note_type_id'
            label='Note Type'
            placeholder='Select note type'
            rules={{ required: 'Note type is required' }}
            selectOptions={noteTypes.map(nt => ({ value: nt.id, label: nt.name }))}
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
            placeholder='Subject'
            rules={{ required: 'Subject is required' }}
            errors={form.formState.errors}
            disabled={form.formState.isSubmitting}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />
          <CustomFormField
            type='textarea'
            register={form.register}
            name='comment'
            label='Comment'
            placeholder='Type your note here...'
            rules={{ required: 'Comment is required' }}
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

export default CreateOrEditNoteModal
