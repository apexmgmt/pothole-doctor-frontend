'use client'

import { PaymentTermPayload, PartnerType, PartnerTypePayload, Unit, UnitPayload } from '@/types'
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
import UnitService from '@/services/api/settings/units.service'

interface CreateOrEditUnitModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  unitId?: string
  unitDetails?: Unit
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Unit name must be at least 2 characters' }),
  group: z.enum(['uom', 'measure'])
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditUnitModal = ({
  mode = 'create',
  open,
  onOpenChange,
  unitId,
  unitDetails,
  onSuccess
}: CreateOrEditUnitModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: unitDetails?.name || '',
      group: (unitDetails?.group as 'uom' | 'measure') || 'uom'
    }
  })

  // Reset form when unitDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: unitDetails?.name || '',
        group: (unitDetails?.group as 'uom' | 'measure') || 'uom'
      })
    }
  }, [unitDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: UnitPayload = {
      name: values.name,
      group: values.group
    }

    if (mode === 'create') {
      try {
        await UnitService.store(payload)
          .then(response => {
            console.log('Unit created:', response)
            toast.success('Unit created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create unit')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the unit!')
      }
    } else if (mode === 'edit' && unitId) {
      try {
        await UnitService.update(unitId, payload)
          .then(response => {
            console.log('Unit updated:', response)
            toast.success('Unit updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update unit')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the unit!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: unitDetails?.name || '',
      group: (unitDetails?.group as 'uom' | 'measure') || 'uom'
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
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
          {/* Unit Name Field */}
          <FormField
            control={form.control}
            name='name'
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
          {/* Group Field */}
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Group <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                    <FormItem className='flex items-center gap-2'>
                      <RadioGroupItem value='uom' id='group-uom' />
                      <Label htmlFor='group-uom'>UOM</Label>
                    </FormItem>
                    <FormItem className='flex items-center gap-2'>
                      <RadioGroupItem value='measure' id='group-measure' />
                      <Label htmlFor='group-measure'>Measure</Label>
                    </FormItem>
                  </RadioGroup>
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
