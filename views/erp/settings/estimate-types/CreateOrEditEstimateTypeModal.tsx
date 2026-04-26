'use client'

import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { EstimateType, EstimateTypePayload } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'

interface CreateOrEditEstimateTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  estimateTypeId?: string
  estimateTypeDetails?: EstimateType
  onSuccess?: () => void
}

interface FormValues {
  name: string
}

const CreateOrEditEstimateTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  estimateTypeId,
  estimateTypeDetails,
  onSuccess
}: CreateOrEditEstimateTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: estimateTypeDetails?.name || ''
    }
  })

  // Reset form when estimateTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: estimateTypeDetails?.name || ''
      })
    }
  }, [estimateTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: EstimateTypePayload = {
      name: values.name
    }

    if (mode === 'create') {
      try {
        await EstimateTypeService.store(payload)
          .then(response => {
            toast.success('Estimate type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create estimate type')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the estimate type!')
      }
    } else if (mode === 'edit' && estimateTypeId) {
      try {
        await EstimateTypeService.update(estimateTypeId, payload)
          .then(response => {
            toast.success('Estimate type updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update estimate type')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the estimate type!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: estimateTypeDetails?.name || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading estimate type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Estimate Type' : 'Edit Estimate Type'}
      description={mode === 'create' ? 'Add a new estimate type to the system' : 'Update estimate type information'}
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
          {/* Estimate Type Name Field */}
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Estimate type name is required',
              minLength: { value: 2, message: 'Estimate type name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter estimate type name' {...field} />
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

export default CreateOrEditEstimateTypeModal
