'use client'

import { Country, CountryPayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import CountryService from '@/services/api/country.service'
import { toast } from 'sonner'
import { useEffect } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'

interface CreateOrEditCountryModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  countryId?: string
  countryDetails?: Country
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Country name must be at least 2 characters' }),
  code: z
    .string()
    .min(2, { message: 'Country code must be at least 2 characters' })
    .max(3, { message: 'Country code must not exceed 3 characters' })
    .toUpperCase()
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditCountryModal = ({
  mode = 'create',
  open,
  onOpenChange,
  countryId,
  countryDetails,
  onSuccess
}: CreateOrEditCountryModalProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: countryDetails?.name || '',
      code: countryDetails?.code || ''
    }
  })

  // Reset form when countryDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: countryDetails?.name || '',
        code: countryDetails?.code || ''
      })
    }
  }, [countryDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: CountryPayload = {
      name: values.name,
      code: values.code
    }

    if (mode === 'create') {
      try {
        await CountryService.store(payload)
          .then(response => {
            console.log('Country created:', response)
            toast.success('Country created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create country')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the country!')
      }
    } else if (mode === 'edit' && countryId) {
      try {
        await CountryService.update(countryId, payload)
          .then(response => {
            console.log('Country updated:', response)
            toast.success('Country updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update country')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the country!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: countryDetails?.name || '',
      code: countryDetails?.code || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Country' : 'Edit Country'}
      description={mode === 'create' ? 'Add a new country to the system' : 'Update country information'}
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
          {/* Country Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter country name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country Code Field */}
          <FormField
            control={form.control}
            name='code'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter country code (e.g., US, UK)'
                    maxLength={3}
                    {...field}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                  />
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

export default CreateOrEditCountryModal
