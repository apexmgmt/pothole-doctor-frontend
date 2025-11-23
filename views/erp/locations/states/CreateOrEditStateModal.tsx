'use client'

import { State, StatePayload, Location } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import StateService from '@/services/api/locations/state.service'
import LocationService from '@/services/api/locations/location.service'

interface CreateOrEditStateModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  stateId?: string
  stateDetails?: State
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'State name must be at least 2 characters' }),
  country_id: z.string().min(1, { message: 'Please select a country' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditStateModal = ({
  mode = 'create',
  open,
  onOpenChange,
  stateId,
  stateDetails,
  onSuccess
}: CreateOrEditStateModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [countriesWithStateAndCities, setCountriesWithStateAndCities] = useState<Location['countries']>([])

  const fetchCountriesWithStateAndCities = async () => {
    try {
      setIsLoading(true)
      LocationService.index()
        .then(response => {
          setCountriesWithStateAndCities(response.data || [])
          setIsLoading(false)
        })
        .catch(error => {
          toast.error(typeof error.message === 'string' ? error.message : 'Failed to fetch locations')
          setIsLoading(false)
        })
    } catch (error) {
      toast.error('Something went wrong while fetching locations!')
      setIsLoading(false)
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stateDetails?.name || '',
      country_id: stateDetails?.country?.id?.toString() || ''
    }
  })

  // Reset form when stateDetails changes or modal opens
  useEffect(() => {
    if (open) {
      fetchCountriesWithStateAndCities()
      form.reset({
        name: stateDetails?.name || '',
        country_id: stateDetails?.country?.id?.toString() || ''
      })
    }
  }, [stateDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: StatePayload = {
      name: values.name,
      country_id: values.country_id
    }

    if (mode === 'create') {
      try {
        await StateService.store(payload)
          .then(response => {
            console.log('State created:', response)
            toast.success('State created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create state')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the state!')
      }
    } else if (mode === 'edit' && stateId) {
      try {
        await StateService.update(stateId, payload)
          .then(response => {
            console.log('State updated:', response)
            toast.success('State updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update state')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the state!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: stateDetails?.name || '',
      country_id: stateDetails?.country?.id?.toString() || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading countries...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New State' : 'Edit State'}
      description={mode === 'create' ? 'Add a new state to the system' : 'Update state information'}
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
          {/* Country Select Field */}
          <FormField
            control={form.control}
            name='country_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a country' />
                    </SelectTrigger>
                  </FormControl>
                  {countriesWithStateAndCities.length > 0 && (
                    <SelectContent>
                      {countriesWithStateAndCities?.map(country => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter state name' {...field} />
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

export default CreateOrEditStateModal
