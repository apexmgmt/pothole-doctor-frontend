'use client'

import React, { useCallback } from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { MultiSelect } from '@/components/ui/select'
import { LeadPayload, ServiceType } from '@/types'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useLoadScript, Autocomplete } from '@react-google-maps/api'

interface AdditionalLeadFieldsProps {
  methods: UseFormReturn<LeadPayload>
  serviceTypes: ServiceType[]
}

const libraries: ('places')[] = ['places']

const AdditionalLeadFields: React.FC<AdditionalLeadFieldsProps> = ({ methods, serviceTypes }) => {
  const {
    control,
    formState: { errors },
    setValue
  } = methods

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null)

  const onLoad = useCallback((autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance)
  }, [])

  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace()
      if (place.formatted_address) {
        setValue('address', place.formatted_address)
      }
    }
  }, [autocomplete, setValue])

  const serviceTypeOptions = serviceTypes.map(service => ({
    value: service.id,
    label: service.name
  }))

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Desired Service(s)</Label>
          <Controller
            name='service_type_ids'
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={serviceTypeOptions}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder='Select service types...'
                className='w-full'
              />
            )}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='pre_qualifi_amount'>Pre-qualified Financing Amount</Label>
          <Controller
            name='pre_qualifi_amount'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type='number'
                step='0.01'
                value={field.value || 0}
                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                placeholder='0.00'
              />
            )}
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Controller
            name='is_tax_exempt'
            control={control}
            render={({ field }) => (
              <Checkbox
                id='is_tax_exempt'
                checked={field.value === 1}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
              />
            )}
          />
          <Label htmlFor='is_tax_exempt' className='cursor-pointer'>
            Tax Exempt
          </Label>
        </div>

        <div className='flex items-center space-x-2'>
          <Controller
            name='is_quic_book'
            control={control}
            render={({ field }) => (
              <Checkbox
                id='is_quic_book'
                checked={field.value === 1}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
              />
            )}
          />
          <Label htmlFor='is_quic_book' className='cursor-pointer'>
            QuickBooks
          </Label>
        </div>
        <div className='col-span-1 lg:col-span-2'>
          <Separator />
        </div>

        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address-search'>Search Location</Label>
          {isLoaded ? (
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <Input type='text' placeholder='Search for an address...' />
            </Autocomplete>
          ) : (
            <Input type='text' placeholder='Loading...' disabled />
          )}
        </div>

        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address'>
            Address <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='address'
            control={control}
            rules={{
              required: 'Address is required'
            }}
            render={({ field }) => <Textarea {...field} placeholder='Enter address' rows={3} />}
          />
          {errors.address && <p className='text-sm text-red-500'>{errors.address.message}</p>}
        </div>
      </div>
    </div>
  )
}

export default AdditionalLeadFields
