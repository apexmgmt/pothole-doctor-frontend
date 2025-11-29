'use client'

import { ServiceType, ServiceTypePayload } from '@/types/service_types.types'
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
import ServiceTypeService from '@/services/api/settings/service_types.service'

interface CreateOrEditServiceTypeModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceTypeId?: string
  serviceTypeDetails?: ServiceType
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Service type name must be at least 2 characters' }),
  is_editable: z.enum(['1', '0']),
  wasted_percent: z.number().min(0, { message: 'Must be at least 0' }).max(100, { message: 'Must be at most 100' }),
  abbreviation: z.string().min(1, { message: 'Abbreviation is required' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditServiceTypeModal = ({
  mode = 'create',
  open,
  onOpenChange,
  serviceTypeId,
  serviceTypeDetails,
  onSuccess
}: CreateOrEditServiceTypeModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: serviceTypeDetails?.name || '',
      is_editable: serviceTypeDetails ? (String(serviceTypeDetails.is_editable) as '1' | '0') : '1',
      wasted_percent: serviceTypeDetails?.wasted_percent ? Number(serviceTypeDetails.wasted_percent) : 0,
      abbreviation: serviceTypeDetails?.abbreviation || ''
    }
  })

  // Reset form when serviceTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: serviceTypeDetails?.name || '',
        is_editable: serviceTypeDetails ? (String(serviceTypeDetails.is_editable) as '1' | '0') : '1',
        wasted_percent: serviceTypeDetails?.wasted_percent ? Number(serviceTypeDetails.wasted_percent) : 0,
        abbreviation: serviceTypeDetails?.abbreviation || ''
      })
    }
  }, [serviceTypeDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    const payload: ServiceTypePayload = {
      name: values.name,
      is_editable: Number(values.is_editable) as 1 | 0,
      wasted_percent: values.wasted_percent,
      abbreviation: values.abbreviation
    }

    try {
      if (mode === 'create') {
        ServiceTypeService.store(payload)
        toast.success('Service type created successfully')
      } else if (mode === 'edit' && serviceTypeId) {
        await ServiceTypeService.update(serviceTypeId, payload)
        toast.success('Service type updated successfully')
      }
      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch (error: any) {
      toast.error(error?.message || 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({
      name: serviceTypeDetails?.name || '',
      is_editable: serviceTypeDetails ? (String(serviceTypeDetails.is_editable) as '1' | '0') : '1',
      wasted_percent: serviceTypeDetails?.wasted_percent ? Number(serviceTypeDetails.wasted_percent) : 0,
      abbreviation: serviceTypeDetails?.abbreviation || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading service type...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create Service Type' : 'Edit Service Type'}
      description={mode === 'create' ? 'Add a new service type' : 'Update service type information'}
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
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter service type name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Is Editable */}
          <FormField
            control={form.control}
            name='is_editable'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Editable <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-4'>
                    <FormItem className='flex items-center gap-2'>
                      <RadioGroupItem value='1' id='editable-yes' />
                      <Label htmlFor='editable-yes'>Yes</Label>
                    </FormItem>
                    <FormItem className='flex items-center gap-2'>
                      <RadioGroupItem value='0' id='editable-no' />
                      <Label htmlFor='editable-no'>No</Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Wasted Percent */}
          <FormField
            control={form.control}
            name='wasted_percent'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wasted Percent <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min={0}
                    max={100}
                    step={1}
                    placeholder='0'
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Abbreviation */}
          <FormField
            control={form.control}
            name='abbreviation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Abbreviation <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder='Enter abbreviation' {...field} />
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

export default CreateOrEditServiceTypeModal
