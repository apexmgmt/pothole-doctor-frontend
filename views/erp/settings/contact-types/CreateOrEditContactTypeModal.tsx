'use client'

import {
  PaymentTermPayload,
  PartnerType,
  PartnerTypePayload,
  PaymentTerm,
  ContactType,
  ContactTypePayload
} from '@/types'
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
import PartnerTypesService from '@/services/api/settings/partner_types.service'
import ContactTypeService from '@/services/api/settings/contact_types.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CreateOrEditContactTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentTerms: PaymentTerm[]
  contactTypeId?: string
  contactTypeDetails?: ContactType
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Contact type name must be at least 2 characters' }),
  payment_term_id: z.string(),
  material_down_payment: z
    .number()
    .min(0, { message: 'Material down payment must be at least 0' })
    .max(100, { message: 'Material down payment cannot exceed 100' }),
  labor_down_payment: z
    .number()
    .min(0, { message: 'Labor down payment must be at least 0' })
    .max(100, { message: 'Labor down payment cannot exceed 100' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditContactTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  paymentTerms,
  contactTypeId,
  contactTypeDetails,
  onSuccess
}: CreateOrEditContactTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: contactTypeDetails?.name || ''
    }
  })

  // Reset form when contactTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: contactTypeDetails?.name || '',
        payment_term_id: contactTypeDetails?.payment_term_id || '',
        material_down_payment: contactTypeDetails?.material_down_payment || 0,
        labor_down_payment: contactTypeDetails?.labor_down_payment || 0
      })
    }
  }, [contactTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: ContactTypePayload = {
      name: values.name,
      payment_term_id: values.payment_term_id,
      material_down_payment: values.material_down_payment,
      labor_down_payment: values.labor_down_payment
    }

    if (mode === 'create') {
      try {
        await ContactTypeService.store(payload)
          .then(response => {
            toast.success('Contact type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create contact type')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the contact type!')
      }
    } else if (mode === 'edit' && contactTypeId) {
      try {
        await ContactTypeService.update(contactTypeId, payload)
          .then(response => {
            toast.success('Contact type updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update contact type')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the contact type!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: contactTypeDetails?.name || '',
      payment_term_id: contactTypeDetails?.payment_term_id || '',
      material_down_payment: contactTypeDetails?.material_down_payment || 0,
      labor_down_payment: contactTypeDetails?.labor_down_payment || 0
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading contact type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Contact Type' : 'Edit Contact Type'}
      description={mode === 'create' ? 'Add a new contact type to the system' : 'Update contact type information'}
      maxWidth='lg'
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
          {/* Contact Type Name Field */}
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
          {/* Payment Term Select Field */}
          <FormField
            control={form.control}
            name='payment_term_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Term</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a payment term' />
                    </SelectTrigger>
                  </FormControl>
                  {paymentTerms.length > 0 && (
                    <SelectContent>
                      {paymentTerms.map(term => (
                        <SelectItem key={term.id} value={term.id.toString()}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Contact Type material down payment Field */}
          <FormField
            control={form.control}
            name='material_down_payment'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Material Down Payment <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='number' placeholder='Enter material down payment' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Contact Type labor down payment Field */}
          <FormField
            control={form.control}
            name='labor_down_payment'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Labor Down Payment <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='number' placeholder='Enter labor down payment' {...field} />
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

export default CreateOrEditContactTypeModal
