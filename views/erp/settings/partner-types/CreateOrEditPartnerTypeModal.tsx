'use client'

import { PaymentTermPayload, PartnerType, PartnerTypePayload } from '@/types'
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

interface CreateOrEditPartnerTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  partnerTypeId?: string
  partnerTypeDetails?: PartnerType
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Partner type name must be at least 2 characters' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditPartnerTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  partnerTypeId,
  partnerTypeDetails,
  onSuccess
}: CreateOrEditPartnerTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: partnerTypeDetails?.name || ''
    }
  })

  // Reset form when partnerTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: partnerTypeDetails?.name || ''
      })
    }
  }, [partnerTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: PartnerTypePayload = {
      name: values.name
    }

    if (mode === 'create') {
      try {
        await PartnerTypesService.store(payload)
          .then(response => {
            console.log('Contractor type created:', response)
            toast.success('Contractor type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create contractor type')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the contractor type!')
      }
    } else if (mode === 'edit' && partnerTypeId) {
      try {
        await PartnerTypesService.update(partnerTypeId, payload)
          .then(response => {
            console.log('Contractor type updated:', response)
            toast.success('Contractor type updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update contractor type')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the contractor type!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: partnerTypeDetails?.name || '',
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading contractor type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Contractor Type' : 'Edit Contractor Type'}
      description={mode === 'create' ? 'Add a new contractor type to the system' : 'Update contractor type information'}
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
                  <Input placeholder='Enter payment term name' {...field} />
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

export default CreateOrEditPartnerTypeModal
