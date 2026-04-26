'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Courier, CourierPayload } from '@/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CourierService from '@/services/api/couriers.service'

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
          {/* Name */}
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter courier name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name='email'
            rules={{
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='email' placeholder='Enter email address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Number */}
          <FormField
            control={form.control}
            name='contact_number'
            rules={{ required: 'Contact number is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Contact Number <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter contact number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website */}
          <FormField
            control={form.control}
            name='website'
            rules={{
              pattern: { value: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/, message: 'Enter a valid URL' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder='https://example.com' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fax */}
          <FormField
            control={form.control}
            name='fax'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fax</FormLabel>
                <FormControl>
                  <Input placeholder='Enter fax number' {...field} />
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

export default CreateOrEditCourierModal
