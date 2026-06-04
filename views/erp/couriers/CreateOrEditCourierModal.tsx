'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Courier, CourierPayload } from '@/types'

import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CourierService from '@/services/api/couriers.service'
import CustomFormField from '@/components/form/CustomFormField'

interface CreateOrEditCourierModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  courierId?: string
  courierDetails?: Courier
  onSuccess?: () => void
}

interface FormValues {
  name: string
  email: string
  contact_number: string
  website: string
  fax: string
}

const CreateOrEditCourierModal = ({
  mode = 'create',
  open,
  onOpenChange,
  courierId,
  courierDetails,
  onSuccess
}: CreateOrEditCourierModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: courierDetails?.name || '',
      email: courierDetails?.email || '',
      contact_number: courierDetails?.contact_number || '',
      website: courierDetails?.website || '',
      fax: courierDetails?.fax || ''
    }
  })

  const {
    register,
    formState: { errors }
  } = form

  const fieldStyle = 'grid grid-cols-[120px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  useEffect(() => {
    if (open) {
      form.reset({
        name: courierDetails?.name || '',
        email: courierDetails?.email || '',
        contact_number: courierDetails?.contact_number || '',
        website: courierDetails?.website || '',
        fax: courierDetails?.fax || ''
      })
    }
  }, [courierDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: CourierPayload = {
      name: values.name,
      email: values.email,
      contact_number: values.contact_number,
      website: values.website,
      fax: values.fax
    }

    if (mode === 'create') {
      try {
        await CourierService.store(payload)
          .then(() => {
            toast.success('Courier created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create courier')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the courier!')
      }
    } else if (mode === 'edit' && courierId) {
      try {
        await CourierService.update(courierId, payload)
          .then(() => {
            toast.success('Courier updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update courier')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the courier!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: courierDetails?.name || '',
      email: courierDetails?.email || '',
      contact_number: courierDetails?.contact_number || '',
      website: courierDetails?.website || '',
      fax: courierDetails?.fax || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading courier...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Courier' : 'Edit Courier'}
      description={mode === 'create' ? 'Add a new courier to the system' : 'Update courier information'}
      maxWidth='md'
      disableClose={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            size='sm'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          {/* Name */}
          <CustomFormField
            name='name'
            label='Name'
            placeholder='Enter courier name'
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Email */}
          <CustomFormField
            name='email'
            label='Email'
            type='email'
            placeholder='Enter email address'
            rules={{
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Contact Number */}
          <CustomFormField
            name='contact_number'
            label='Contact Number'
            placeholder='Enter contact number'
            rules={{ required: 'Contact number is required' }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Website */}
          <CustomFormField
            name='website'
            label='Website'
            placeholder='https://example.com'
            rules={{
              pattern: { value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/, message: 'Enter a valid URL' }
            }}
            register={register}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Fax */}
          <CustomFormField
            name='fax'
            label='Fax'
            placeholder='Enter fax number'
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

export default CreateOrEditCourierModal
