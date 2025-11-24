'use client'

import { PaymentTermPayload, PartnerType, PartnerTypePayload, NoteType, NoteTypePayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import NoteTypeService from '@/services/api/settings/note_types.service'

interface CreateOrEditNoteTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  noteTypeId?: string
  noteTypeDetails?: NoteType
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Note type name must be at least 2 characters' }),
  status: z.boolean()
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditNoteTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  noteTypeId,
  noteTypeDetails,
  onSuccess
}: CreateOrEditNoteTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: noteTypeDetails?.name || '',
      status: noteTypeDetails?.status ? true : false
    }
  })

  // Reset form when partnerTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: noteTypeDetails?.name || '',
        status: noteTypeDetails?.status ? true : false
      })
    }
  }, [noteTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: NoteTypePayload = {
      name: values.name,
      status: mode === 'create' ? 1 : values.status ? 1 : 0
    }

    if (mode === 'create') {
      try {
        await NoteTypeService.store(payload)
          .then(response => {
            toast.success('Note type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create note type')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the note type!')
      }
    } else if (mode === 'edit' && noteTypeId) {
      try {
        await NoteTypeService.update(noteTypeId, payload)
          .then(response => {
            toast.success('Note type updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update note type')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the note type!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: noteTypeDetails?.name || '',
      status: noteTypeDetails?.status ? true : false
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading note type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Note Type' : 'Edit Note Type'}
      description={mode === 'create' ? 'Add a new note type to the system' : 'Update note type information'}
      maxWidth='sm'
      disableClose={form.formState.isSubmitting}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* Contractor Type Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter contractor type name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Status Radio Group */}
          {mode === 'edit' && (
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={val => field.onChange(val === 'true')}
                      value={field.value ? 'true' : 'false'}
                      className='space-y-2'
                    >
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='true' id='active' />
                        <Label htmlFor='active' className='cursor-pointer'>
                          Active
                        </Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='false' id='inactive' />
                        <Label htmlFor='inactive' className='cursor-pointer'>
                          Inactive
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditNoteTypeModal
