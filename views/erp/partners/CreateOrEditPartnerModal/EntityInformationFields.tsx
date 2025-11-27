'use client'

import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface EntityInformationFieldsProps {
  form: UseFormReturn<any>
}

export function EntityInformationFields({ form }: EntityInformationFieldsProps) {
  const user_type = form.watch('user_type')

  return (
    <div className='flex flex-col gap-4'>
      {/* Status Radio Group */}
      <FormField
        control={form.control}
        name='status'
        render={({ field }) => (
          <FormItem className='flex flex-row gap-4'>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={val => field.onChange(val === 'true')}
                value={field.value ? 'true' : 'false'}
                className='flex flex-row gap-4 items-center'
              >
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='true' id='status-active' />
                  <Label htmlFor='status-active' className='cursor-pointer'>
                    Active
                  </Label>
                </div>
                <div className='flex gap-2 items-center'>
                  <RadioGroupItem value='false' id='status-disabled' />
                  <Label htmlFor='status-disabled' className='cursor-pointer'>
                    Disabled
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Entity Radio Group - Only show if user_type is contractor */}
      {user_type === 'contractor' && (
        <FormField
          control={form.control}
          name='entity'
          render={({ field }) => (
            <FormItem className='flex flex-row gap-4'>
              <FormLabel>Entity</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={val => field.onChange(val === 'individual' ? 'individual' : 'business')}
                  value={field.value === 'individual' ? 'individual' : 'business'}
                  className='flex flex-row gap-4 items-center'
                >
                  <div className='flex gap-2 items-center'>
                    <RadioGroupItem value='individual' id='entity-individual' />
                    <Label htmlFor='entity-individual' className='cursor-pointer'>
                      Individual
                    </Label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <RadioGroupItem value='business' id='entity-business' />
                    <Label htmlFor='entity-business' className='cursor-pointer'>
                      Business
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Is Email Configured Checkbox */}
      <FormField
        control={form.control}
        name='is_email_confirmation'
        render={({ field }) => (
          <FormItem className='flex flex-row items-center gap-2'>
            <FormControl>
              <Checkbox
                checked={!!field.value}
                onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                id='is_email_confirmation'
              />
            </FormControl>
            <FormLabel htmlFor='is_email_confirmation' className='mb-0 cursor-pointer'>
              Email Confirmation
            </FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* SSN Field */}
      <FormField
        control={form.control}
        name='ssn'
        render={({ field }) => (
          <FormItem>
            <FormLabel>SSN</FormLabel>
            <FormControl>
              <Input placeholder='Enter SSN' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* EIN Field */}
      <FormField
        control={form.control}
        name='ein'
        render={({ field }) => (
          <FormItem>
            <FormLabel>EIN</FormLabel>
            <FormControl>
              <Input placeholder='Enter EIN' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes Field */}
      <FormField
        control={form.control}
        name='notes'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder='Enter notes' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
