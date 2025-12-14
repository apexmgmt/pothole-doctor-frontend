'use client'

import React from 'react'
import { Controller, UseFormReturn } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LeadPayload } from '@/types'

interface ContactLeadFieldsProps {
  methods: UseFormReturn<LeadPayload>
}

const ContactLeadFields: React.FC<ContactLeadFieldsProps> = ({ methods }) => {
  const {
    control,
    formState: { errors }
  } = methods

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
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
          <Controller
            name='best_time'
            control={control}
            render={({ field }) => <Input {...field} type='text' />}
          />
        </div>
      </div>
    </div>
  )
}

export default ContactLeadFields
