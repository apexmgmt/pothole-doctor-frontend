'use client'

import { useEffect, useState } from 'react'

import { useForm, Controller } from 'react-hook-form'

import { toast } from 'sonner'

import {
  PaymentTermPayload,
  PartnerType,
  PartnerTypePayload,
  PaymentTerm,
  ContactType,
  ContactTypePayload
} from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'


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

interface FormValues {
  name: string
  payment_term_id: string
  material_down_payment: number
  labor_down_payment: number
}

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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      name: contactTypeDetails?.name || '',
      payment_term_id: contactTypeDetails?.payment_term_id || '',
      material_down_payment: contactTypeDetails?.material_down_payment || 0,
      labor_down_payment: contactTypeDetails?.labor_down_payment || 0
    }
  })

  // Reset form when contactTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      reset({
        name: contactTypeDetails?.name || '',
        payment_term_id: contactTypeDetails?.payment_term_id || '',
        material_down_payment: contactTypeDetails?.material_down_payment || 0,
        labor_down_payment: contactTypeDetails?.labor_down_payment || 0
      })
    }
  }, [contactTypeDetails, open, reset])

  const onSubmit = async (values: FormValues) => {
    const payload: ContactTypePayload = {
      name: values.name,
      payment_term_id: values.payment_term_id,
      material_down_payment: Number(values.material_down_payment),
      labor_down_payment: Number(values.labor_down_payment)
    }

    setIsLoading(true)

    try {
      if (mode === 'create') {
        await ContactTypeService.store(payload)
        toast.success('Contact type created successfully')
        reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && contactTypeId) {
        await ContactTypeService.update(contactTypeId, payload)
        toast.success('Contact type updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    reset({
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
      maxWidth='md'
      disableClose={isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className='flex-1'>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
        {/* Contact Type Name Field */}
        <div>
          <Label htmlFor='name' className='mb-1'>
            Name <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='name'
            control={control}
            rules={{
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            }}
            render={({ field }) => <Input {...field} id='name' placeholder='Enter contractor type name' />}
          />
          {errors.name && <p className='text-sm font-medium text-destructive mt-1'>{errors.name.message}</p>}
        </div>

        {/* Payment Term Select Field */}
        <div>
          <Label htmlFor='payment_term_id' className='mb-1'>
            Payment Term <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='payment_term_id'
            control={control}
            rules={{
              required: 'Payment term is required'
            }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id='payment_term_id' className='w-full'>
                  <SelectValue placeholder='Select a payment term' />
                </SelectTrigger>
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
            )}
          />
          {errors.payment_term_id && (
            <p className='text-sm font-medium text-destructive mt-1'>{errors.payment_term_id.message}</p>
          )}
        </div>

        {/* Contact Type material down payment Field */}
        <div>
          <Label htmlFor='material_down_payment' className='mb-1'>
            Material Down Payment <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='material_down_payment'
            control={control}
            rules={{
              required: 'Material down payment is required',
              min: {
                value: 0,
                message: 'Material down payment must be at least 0'
              },
              max: {
                value: 100,
                message: 'Material down payment must not exceed 100'
              }
            }}
            render={({ field }) => (
              <Input
                {...field}
                id='material_down_payment'
                type='number'
                min={0}
                max={100}
                step={0.01}
                placeholder='Enter material down payment'
                onChange={e => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {errors.material_down_payment && (
            <p className='text-sm font-medium text-destructive mt-1'>{errors.material_down_payment.message}</p>
          )}
        </div>

        {/* Contact Type labor down payment Field */}
        <div>
          <Label htmlFor='labor_down_payment' className='mb-1'>
            Labor Down Payment <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='labor_down_payment'
            control={control}
            rules={{
              required: 'Labor down payment is required',
              min: {
                value: 0,
                message: 'Labor down payment must be at least 0'
              },
              max: {
                value: 100,
                message: 'Labor down payment must not exceed 100'
              }
            }}
            render={({ field }) => (
              <Input
                {...field}
                id='labor_down_payment'
                type='number'
                min={0}
                max={100}
                step={0.01}
                placeholder='Enter labor down payment'
                onChange={e => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {errors.labor_down_payment && (
            <p className='text-sm font-medium text-destructive mt-1'>{errors.labor_down_payment.message}</p>
          )}
        </div>
      </form>
    </CommonDialog>
  )
}

export default CreateOrEditContactTypeModal
