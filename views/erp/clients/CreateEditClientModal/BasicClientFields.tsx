'use client'

import React from 'react'

import { Controller, UseFormReturn } from 'react-hook-form'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  CreatableSelect,
  MultiSelect
} from '@/components/ui/select'
import { ClientPayload, Company, InterestLevel, ServiceType } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'

interface BasicClientFieldsProps {
  type: 'lead' | 'customer'
  methods: UseFormReturn<ClientPayload>
  companies: Company[]
  interestLevels: InterestLevel[]
  serviceTypes: ServiceType[]
}

const BasicClientFields: React.FC<BasicClientFieldsProps> = ({
  type,
  methods,
  companies,
  interestLevels,
  serviceTypes
}) => {
  const {
    control,
    formState: { errors }
  } = methods

  const companyOptions = companies.map(company => ({
    value: company.name,
    label: company.name
  }))

  const serviceTypeOptions = serviceTypes.map(service => ({
    value: service.id,
    label: service.name
  }))

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
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
        <div className='space-y-2'>
          <Label htmlFor='phone'>
            Main Phone <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='phone'
            control={control}
            rules={{
              required: 'Main Phone is required',
              validate: value => {
                const numStr = String(value).replace(/\D/g, '')

                return numStr.length === 10 || 'Phone number must be 10 digits'
              }
            }}
            render={({ field }) => <Input {...field} type='tel' placeholder='10 digit phone number' />}
          />
          {errors.phone && <p className='text-sm text-red-500'>{errors.phone.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='cell_phone'>Cell Phone</Label>
          <Controller
            name='cell_phone'
            control={control}
            rules={{
              validate: value => {
                if (!value || value === '') return true
                const numStr = String(value).replace(/\D/g, '')

                return numStr.length === 10 || 'Phone number must be 10 digits'
              }
            }}
            render={({ field }) => <Input {...field} type='tel' placeholder='10 digit phone number' />}
          />
          {errors.cell_phone && <p className='text-sm text-red-500'>{errors.cell_phone.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>
            Email <span className='text-red-500'>*</span>
          </Label>
          <Controller
            name='email'
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => <Input {...field} type='email' placeholder='Enter email' />}
          />
          {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='cc_email'>CC Email</Label>
          <Controller
            name='cc_email'
            control={control}
            rules={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => <Input {...field} type='email' placeholder='Enter CC email' />}
          />
          {errors.cc_email && <p className='text-sm text-red-500'>{errors.cc_email.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='spouse_name'>Spouse Name</Label>
          <Controller
            name='spouse_name'
            control={control}
            render={({ field }) => <Input {...field} placeholder='Enter spouse name' />}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='spouse_phone'>Spouse Phone</Label>
          <Controller
            name='spouse_phone'
            control={control}
            rules={{
              validate: value => {
                if (!value || value === '') return true
                const numStr = String(value).replace(/\D/g, '')

                return numStr.length === 10 || 'Phone number must be 10 digits'
              }
            }}
            render={({ field }) => <Input {...field} type='tel' placeholder='10 digit phone number' />}
          />
          {errors.spouse_phone && <p className='text-sm text-red-500'>{errors.spouse_phone.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='best_time'>Best Time to Reach</Label>
          <Controller name='best_time' control={control} render={({ field }) => <Input {...field} type='text' />} />
        </div>

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
          <Label htmlFor='pre_qualified_amount'>Pre-qualified Financing Amount</Label>
          <Controller
            name='pre_qualified_amount'
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
            name='is_quick_book'
            control={control}
            render={({ field }) => (
              <Checkbox
                id='is_quick_book'
                checked={field.value === 1}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
              />
            )}
          />
          <Label htmlFor='is_quick_book' className='cursor-pointer'>
            QuickBooks
          </Label>
        </div>
      </div>
    </div>
  )
}

export default BasicClientFields
