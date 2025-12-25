'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  CreatableMultiSelect
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { BusinessLocation, PartnerType } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'

interface ContractorDetailsFieldsProps {
  form: UseFormReturn<any>
  skills: any[]
  partnerTypes: PartnerType[]
}

export function ContractorDetailsFields({ form, skills, partnerTypes }: ContractorDetailsFieldsProps) {
  const user_type = form.watch('user_type')

  // Don't render if role is Referral
  if (user_type === 'referral') {
    return null
  }

  return (
    <>
      {/* Partner type Field */}
      <FormField
        control={form.control}
        name='partner_type_id'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contractor Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select a contractor type' />
                </SelectTrigger>
              </FormControl>
              {partnerTypes.length > 0 && (
                <SelectContent>
                  {partnerTypes.map(partnerType => (
                    <SelectItem key={partnerType.id} value={partnerType.id.toString()}>
                      {partnerType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Skills Field */}
      <FormField
        control={form.control}
        name='skills'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <CreatableMultiSelect
                options={skills?.map(skill => ({
                  value: skill.name,
                  label: skill.name
                }))}
                selected={field.value || []}
                onChange={field.onChange}
                placeholder='Select or type to add skills'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Schedule Color Field */}
      <FormField
        control={form.control}
        name='schedule_color'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Schedule Color</FormLabel>
            <FormControl>
              <Input className='max-w-24' type='color' placeholder='Select schedule color' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* In House Contractor Checkbox */}
      <FormField
        control={form.control}
        name='in_house_contractor'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center gap-2'>
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                id='in_house_contractor'
              />
            </FormControl>
            <FormLabel htmlFor='in_house_contractor' className='mb-0 cursor-pointer'>
              In House Contractor
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Insurance Expiration Field */}
      <FormField
        control={form.control}
        name='insurance_expiration'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insurance Expiration</FormLabel>
            <FormControl>
              <DateTimePicker
                value={field.value ? Number(field.value) : null}
                onChange={val => field.onChange(val)}
                placeholder='Select insurance expiration date & time'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* WCB Expiration Field */}
      <FormField
        control={form.control}
        name='w9_expiration'
        render={({ field }) => (
          <FormItem>
            <FormLabel>WCB Expiration</FormLabel>
            <FormControl>
              <DateTimePicker
                value={field.value ? Number(field.value) : null}
                onChange={val => field.onChange(val)}
                placeholder='Select WCB expiration date & time'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
