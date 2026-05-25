'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { NoteType, ClientNotePayload } from '@/types'
import NoteTypeService from '@/services/api/settings/note_types.service'
import InvoiceNoteService from '@/services/api/invoices/invoice-notes.service'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { SpinnerCustom } from '@/components/ui/spinner'
import CustomFormField from '@/components/form/CustomFormField'

interface InvoiceAddNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  clientId?: string
  mode?: 'create' | 'edit'
  noteId?: string
  noteDetails?: any
  onSuccess?: () => void
}

const InvoiceAddNoteModal = ({
  open,
  onOpenChange,
  invoiceId,
  clientId,
  mode = 'create',
  noteId,
  noteDetails,
  onSuccess
}: InvoiceAddNoteModalProps) => {
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

  const {
    reset,
    watch,
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = form

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

  useEffect(() => {
    if (open) {
      reset({
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
        await InvoiceNoteService.update(invoiceId, noteId, values)
        toast.success('Note updated successfully')
      } else {
        await InvoiceNoteService.store(invoiceId, values)
        toast.success('Note created successfully')
      }

      reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save note')
    }
  }

  const onCancel = () => {
    reset()
    onOpenChange(false)
  }

  const title = mode === 'edit' ? 'Edit Note' : 'Add Note'

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

  const fieldStyle = 'grid grid-cols-[72px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      open={open}
      onOpenChange={open => {
        if (!open) onCancel()
      }}
      title={title}
      maxWidth='xl'
      isLoading={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            size='sm'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            size='sm'
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !watch('note_type_id') || !watch('subject') || !watch('comment')}
            className='flex-1'
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-y-2'>
          <CustomFormField
            name='note_type_id'
            label='Note Type'
            type='select'
            placeholder='Select note type'
            rules={{ required: 'Note type is required' }}
            selectOptions={noteTypes.map(nt => ({ value: nt.id, label: nt.name }))}
            control={control}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='subject'
            label='Subject'
            placeholder='Enter subject'
            rules={{ required: 'Subject is required' }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          <CustomFormField
            name='comment'
            label='Comment'
            type='textarea'
            placeholder='Type your note here...'
            rules={{ required: 'Comment is required' }}
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

export default InvoiceAddNoteModal
