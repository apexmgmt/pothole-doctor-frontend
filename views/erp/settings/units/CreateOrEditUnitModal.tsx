'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Unit, UnitPayload } from '@/types'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import UnitService from '@/services/api/settings/units.service'

interface CreateOrEditUnitModalProps {
  group?: string | 'uom' | 'measure'
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string
  unitDetails?: Unit
  onSuccess?: () => void
}

type UnitFormValues = {
  name: string
  group: string
}

const CreateOrEditUnitModal = ({
  group,
  mode = 'create',
  open,
  onOpenChange,
  unitId,
  unitDetails,
  onSuccess
}: CreateOrEditUnitModalProps) => {
  const form = useForm<UnitFormValues>({
    defaultValues: {
      name: unitDetails?.name || '',
      group: group || ''
    }
  })

  // Reset form when unitDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: unitDetails?.name || '',
        group: group || ''
      })
    }
  }, [unitDetails, open, form])

  const handleApiError = (error: any, fallbackMessage: string) => {
    if (error?.errors && typeof error.errors === 'object') {
      Object.entries(error.errors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages)

        form.setError(field as keyof UnitFormValues, { type: 'server', message: msg })
      })

      if (error.message) {
        toast.error(error.message)
      }
    } else {
      toast.error(typeof error.message === 'string' ? error.message : fallbackMessage)
    }
  }

  const onSubmit = async (values: UnitFormValues) => {
    const payload: UnitPayload = {
      name: values.name,
      group: group || ''
    }

    if (mode === 'create') {
      try {
        await UnitService.store(payload)
          .then(() => {
            toast.success('Unit created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => handleApiError(error, 'Failed to create unit'))
      } catch {
        toast.error('Something went wrong while creating the unit!')
      }
    } else if (mode === 'edit' && unitId) {
      try {
        await UnitService.update(unitId, payload)
          .then(() => {
            toast.success('Unit updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => handleApiError(error, 'Failed to update unit'))
      } catch {
        toast.error('Something went wrong while updating the unit!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: unitDetails?.name || '',
      group: group || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading unit...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Unit' : 'Edit Unit'}
      description={mode === 'create' ? 'Add a new unit to the system' : 'Update unit information'}
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
              required: 'Unit name is required',
              minLength: { value: 2, message: 'Unit name must be at least 2 characters' }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter unit name' {...field} />
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

export default CreateOrEditUnitModal
