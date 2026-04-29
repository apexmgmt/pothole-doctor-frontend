'use client'

import React from 'react'

import { Controller, UseFormReturn } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, CreatableSelect } from '@/components/ui/select'
import { BusinessLocation, ClientPayload, ClientSource, Company, ContactType, InterestLevel, Staff } from '@/types'
import { Separator } from '@/components/ui/separator'

interface BasicClientReferenceFieldsProps {
  type: 'lead' | 'customer'
  methods: UseFormReturn<ClientPayload>
  clientSources: ClientSource[]
  staffs: Staff[]
  businessLocations: BusinessLocation[]
  contactTypes: ContactType[]
}

const BasicClientReferenceFields: React.FC<BasicClientReferenceFieldsProps> = ({
  type,
  methods,
  clientSources,
  staffs,
  businessLocations,
  contactTypes
}) => {
  const {
    control,
    formState: { errors }
  } = methods

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='location_id'>
            Location <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='location_id'
            control={control}
            rules={{ required: 'Location is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Location' />
                </SelectTrigger>
                <SelectContent>
                  {businessLocations.map(location => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.location_id && <p className='text-sm text-red-500'>{errors.location_id.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='reference_id'>
            Sales Representative <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='reference_id'
            control={control}
            rules={{ required: 'Sales Representative is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select sales rep' />
                </SelectTrigger>
                <SelectContent>
                  {staffs?.length > 0 &&
                    staffs?.map(staff => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.first_name} {staff.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.reference_id && <p className='text-sm text-red-500'>{errors.reference_id.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='source_id'>
            Lead Source <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='source_id'
            control={control}
            rules={{ required: 'Lead Source is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Lead Source' />
                </SelectTrigger>
                <SelectContent>
                  {clientSources.map(source => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.source_id && <p className='text-sm text-red-500'>{errors.source_id.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='type'>
            Contact Type <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='contact_type_id'
            control={control}
            rules={{ required: 'Contact Type is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
        </div>
      </div>
    </div>
  )
}

export default BasicClientReferenceFields
