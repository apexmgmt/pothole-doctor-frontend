'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CreatableSelect, MultiSelect } from '@/components/ui/select'
import { BusinessLocation, Company } from '@/types'

interface BasicInformationFieldsProps {
  form: UseFormReturn<any>
  businessLocations: BusinessLocation[]
  companies: Company[]
}

export function BasicInformationFields({ form, businessLocations, companies }: BasicInformationFieldsProps) {
  return (
    <div className='col-span-2 grid grid-cols-2 gap-4'>
      {/* User type Radio Group */}
      <FormField
        control={form.control}
        name='user_type'
        rules={{ required: 'Role is required' }}
        render={({ field }) => (
          <FormItem className='flex flex-row gap-4'>
            <FormLabel>Role</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={val => field.onChange(val)}
                value={field.value}
                className='flex flex-row gap-4 items-center'
              >
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='contractor' id='user_type-contractor' />
                  <Label htmlFor='user_type-contractor' className='cursor-pointer'>
                    Contractor
                  </Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='referral' id='user_type-referral' />
                  <Label htmlFor='user_type-referral' className='cursor-pointer'>
                    Referral
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className='col-span-2 grid grid-cols-2 gap-4'>
        {/* Location id Field */}
        <FormField
          control={form.control}
          name='location_id'
          rules={{
            required: 'Location is required',
            validate: value => (value && value.length > 0) || 'At least one location must be selected'
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Location<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={businessLocations.map(loc => ({
                    value: loc.id.toString(),
                    label: loc.name
                  }))}
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder='Select locations'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Company Name Field */}
        <FormField
          control={form.control}
          name='company_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <CreatableSelect
                  options={companies.map(company => ({
                    value: company.name,
                    label: company.name
                  }))}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder='Select or type company name'
                  className='w-full'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='col-span-2 grid grid-cols-2 gap-4'>
        {/* First Name Field */}
        <FormField
          control={form.control}
          name='first_name'
          rules={{
            required: 'First name is required',
            minLength: { value: 2, message: 'First name must be at least 2 characters' }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                First Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Enter first name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Last Name Field */}
        <FormField
          control={form.control}
          name='last_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter last name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='col-span-2 grid grid-cols-2 gap-4'>
        {/* Email Field */}
        <FormField
          control={form.control}
          name='email'
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email<span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input type='email' placeholder='Enter email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Phone Field */}
        <FormField
          control={form.control}
          name='phone'
          rules={{
            minLength: { value: 7, message: 'Phone number must be at least 7 characters' }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type='tel' placeholder='Enter phone' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Fax Field */}
      <FormField
        control={form.control}
        name='fax'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fax</FormLabel>
            <FormControl>
              <Input type='tel' placeholder='Enter fax' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Password Field */}
      <FormField
        control={form.control}
        name='password'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type='password' placeholder='Enter password' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
