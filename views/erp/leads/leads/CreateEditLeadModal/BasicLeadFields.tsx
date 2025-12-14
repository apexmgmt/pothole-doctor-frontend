'use client'

import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, CreatableSelect } from '@/components/ui/select'
import { BusinessLocation, ClientSource, Company, InterestLevel, LeadPayload, Staff } from '@/types'
import { Separator } from '@/components/ui/separator'

interface BasicLeadFieldsProps {
  methods: UseFormReturn<LeadPayload>
  companies: Company[]
  clientSources: ClientSource[]
  interestLevels: InterestLevel[]
  staffs: Staff[]
  businessLocations: BusinessLocation[]
}

const BasicLeadFields: React.FC<BasicLeadFieldsProps> = ({
  methods,
  companies,
  clientSources,
  interestLevels,
  staffs,
  businessLocations
}) => {
  const {
    control,
    formState: { errors }
  } = methods

  const companyOptions = companies.map(company => ({
    value: company.name,
    label: company.name
  }))

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
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
                  <SelectValue placeholder='Select lead source' />
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
            name='type'
            control={control}
            rules={{ required: 'Contact Type is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='lead'>Lead</SelectItem>
                  <SelectItem value='customer'>Customer</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.type && <p className='text-sm text-red-500'>{errors.type.message}</p>}
        </div>

        <div className='col-span-2'>
          <Separator />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='company_name'>Company Name</Label>
          <Controller
            name='company_name'
            control={control}
            render={({ field }) => (
              <CreatableSelect
                options={companyOptions}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder='Select or create company'
                className='w-full'
              />
            )}
          />
          {errors.company_name && <p className='text-sm text-red-500'>{errors.company_name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='first_name'>
            First Name <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='first_name'
            control={control}
            rules={{ required: 'First Name is required' }}
            render={({ field }) => <Input {...field} placeholder='Enter first name' />}
          />
          {errors.first_name && <p className='text-sm text-red-500'>{errors.first_name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='last_name'>
            Last Name <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='last_name'
            control={control}
            rules={{ required: 'Last Name is required' }}
            render={({ field }) => <Input {...field} placeholder='Enter last name' />}
          />
          {errors.last_name && <p className='text-sm text-red-500'>{errors.last_name.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='display_name'>Display Name</Label>
          <Controller
            name='display_name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Enter display name' />}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='interest_level_id'>
            Interest Level <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='interest_level_id'
            control={control}
            rules={{ required: 'Interest Level is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select interest level' />
                </SelectTrigger>
                <SelectContent>
                  {interestLevels.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.interest_level_id && <p className='text-sm text-red-500'>{errors.interest_level_id.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='status'>
            Status <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='status'
            control={control}
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <Select value={String(field.value)} onValueChange={value => field.onChange(Number(value))}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>Active</SelectItem>
                  <SelectItem value='0'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className='text-sm text-red-500'>{errors.status.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='lead_cost'>Lead Cost</Label>
          <Controller
            name='lead_cost'
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
      </div>
    </div>
  )
}

export default BasicLeadFields
