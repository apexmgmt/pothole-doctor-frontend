'use client'

import { VendorSalesman, VendorSalesmanPayload } from '@/types'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import VendorSalesmanService from '@/services/api/vendors/vendor-salesman.service'

interface CreateOrEditSalesmanModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  salesmanId?: string
  salesmanDetails?: VendorSalesman
  onSuccess?: () => void
}

interface FormValues {
  name: string
  email: string
  phone: string
  comment: string
  ext: string
}

const CreateOrEditSalesmanModal = ({
  mode = 'create',
  open,
  onOpenChange,
  vendorId,
  salesmanId,
  salesmanDetails,
  onSuccess
}: CreateOrEditSalesmanModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: salesmanDetails?.name ?? '',
      email: salesmanDetails?.email ?? '',
      phone: salesmanDetails?.phone ?? '',
      comment: salesmanDetails?.comment ?? '',
      ext: salesmanDetails?.ext ?? ''
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: salesmanDetails?.name ?? '',
        email: salesmanDetails?.email ?? '',
        phone: salesmanDetails?.phone ?? '',
        comment: salesmanDetails?.comment ?? '',
        ext: salesmanDetails?.ext ?? ''
      })
    }
  }, [salesmanDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    const payload: VendorSalesmanPayload = {
      vendor_id: vendorId,
      name: values.name,
      email: values.email,
      phone: values.phone,
      comment: values.comment,
      ext: values.ext
    }

    try {
      if (mode === 'create') {
        await VendorSalesmanService.store(payload)
        toast.success('Salesman added successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && salesmanId) {
        await VendorSalesmanService.update(salesmanId, payload)
        toast.success('Salesman updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save salesman')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Processing salesman...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Salesman' : 'Edit Salesman'}
      description={mode === 'create' ? 'Add a new salesman for this vendor.' : 'Update salesman details.'}
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
                  <Input placeholder='Enter name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            rules={{
              required: 'Email is required',
              minLength: { value: 2, message: 'Email must be at least 2 characters' }
              
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='email' placeholder='Enter email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone'
            rules={{
              required: 'Phone is required',
              minLength: { value: 9, message: 'Phone must be at least 9 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input type='tel' placeholder='Enter phone' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='ext'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ext
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter ext' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='comment'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Input placeholder='Enter comment (optional)' {...field} />
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

export default CreateOrEditSalesmanModal
