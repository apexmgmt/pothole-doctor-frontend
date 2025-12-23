'use client'

import { CommissionType, CommissionTypePayload } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import CommissionTypeService from '@/services/api/settings/commission_types.service'

interface CreateOrEditCommissionTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  commissionTypeId?: string
  commissionTypeDetails?: CommissionType
  onSuccess?: () => void
}

interface FormValues {
  name: string
}

const CreateOrEditCommissionTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  commissionTypeId,
  commissionTypeDetails,
  onSuccess
}: CreateOrEditCommissionTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: commissionTypeDetails?.name || ''
    }
  })

  // Reset form when partnerTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: commissionTypeDetails?.name || ''
      })
    }
  }, [commissionTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    if (!values.name || values.name.length < 2) {
      toast.error('Commission type name must be at least 2 characters')
      return
    }

    const payload: CommissionTypePayload = {
      name: values.name
    }

    if (mode === 'create') {
      try {
        await CommissionTypeService.store(payload)
          .then(response => {
            toast.success('Commission type created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create commission type')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the commission type!')
      }
    } else if (mode === 'edit' && commissionTypeId) {
      try {
        await CommissionTypeService.update(commissionTypeId, payload)
          .then(response => {
            toast.success('Commission type updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update commission type')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the commission type!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: commissionTypeDetails?.name || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading commission type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Commission Type' : 'Edit Commission Type'}
      description={mode === 'create' ? 'Add a new commission type to the system' : 'Update commission type information'}
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
          {/* Commission Type Name Field */}
          <FormField
            control={form.control}
            name='name'
            rules={{
              required: 'Commission type name is required',
              minLength: { value: 2, message: 'Commission type name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter commission type name' {...field} />
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

export default CreateOrEditCommissionTypeModal
