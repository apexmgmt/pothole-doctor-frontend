'use client'

import { State, StatePayload, Location, City, CityPayload } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useState, useMemo } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import StateService from '@/services/api/locations/state.service'
import LocationService from '@/services/api/locations/location.service'
import CityService from '@/services/api/locations/city.service'

interface CreateOrEditCityModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  cityId?: string
  cityDetails?: City
  onSuccess?: () => void
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'City name must be at least 2 characters' }),
  country_id: z.string().min(1, { message: 'Please select a country' }),
  state_id: z.string().min(1, { message: 'Please select a state' })
})

type FormValues = z.infer<typeof formSchema>

const CreateOrEditCityModal = ({
  mode = 'create',
  open,
  onOpenChange,
  cityId,
  cityDetails,
  onSuccess
}: CreateOrEditCityModalProps) => {
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
      name: cityDetails?.name || '',
      country_id: cityDetails?.state?.country?.id?.toString() || '',
      state_id: cityDetails?.state?.id?.toString() || ''
    }
  })

  // Watch country_id to filter states
  const selectedCountryId = form.watch('country_id')

  // Get states based on selected country
  const availableStates = useMemo(() => {
    if (!selectedCountryId) return []
    const selectedCountry = countriesWithStateAndCities.find(country => country.id.toString() === selectedCountryId)
    return selectedCountry?.states || []
  }, [selectedCountryId, countriesWithStateAndCities])

  // Reset state_id when country changes
  useEffect(() => {
    if (selectedCountryId) {
      const currentStateId = form.getValues('state_id')
      const isStateInCountry = availableStates.some(state => state.id.toString() === currentStateId)

      // Only reset if the current state is not in the newly selected country
      if (!isStateInCountry && !cityDetails) {
        form.setValue('state_id', '')
      }
    }
  }, [selectedCountryId, availableStates, form, cityDetails])

  // Reset form when cityDetails changes or modal opens
  useEffect(() => {
    if (open) {
      fetchCountriesWithStateAndCities()
      form.reset({
        name: cityDetails?.name || '',
        country_id: cityDetails?.state?.country?.id?.toString() || '',
        state_id: cityDetails?.state?.id?.toString() || ''
      })
    }
  }, [cityDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    const payload: CityPayload = {
      name: values.name,
      country_id: values.country_id,
      state_id: values.state_id
    }

    if (mode === 'create') {
      try {
        await CityService.store(payload)
          .then(response => {
            console.log('City created:', response)
            toast.success('City created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create city')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the city!')
      }
    } else if (mode === 'edit' && cityId) {
      try {
        await CityService.update(cityId, payload)
          .then(response => {
            console.log('City updated:', response)
            toast.success('City updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update city')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the city!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: cityDetails?.name || '',
      country_id: cityDetails?.state?.country?.id?.toString() || '',
      state_id: cityDetails?.state?.id?.toString() || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading locations...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New City' : 'Edit City'}
      description={mode === 'create' ? 'Add a new city to the system' : 'Update city information'}
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
                      {countriesWithStateAndCities.map(country => (
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

          {/* State Select Field */}
          <FormField
            control={form.control}
            name='state_id'
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={!selectedCountryId || availableStates.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a state' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableStates.length === 0 ? (
                      <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                        {!selectedCountryId ? 'Please select a country first' : 'No states available'}
                      </div>
                    ) : (
                      availableStates.map(state => (
                        <SelectItem key={state.id} value={state.id.toString()}>
                          {state.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City Name Field */}
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>City Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter city name' {...field} />
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

export default CreateOrEditCityModal
