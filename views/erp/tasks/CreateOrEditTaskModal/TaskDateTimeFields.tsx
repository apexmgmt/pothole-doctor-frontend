import { Clock8Icon } from 'lucide-react'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'

interface TaskDateTimeFieldsProps {
  form: any
}

export function TaskDateTimeFields({ form }: TaskDateTimeFieldsProps) {
  return (
    <>
      {/* Start date field (required) */}
      <FormField
        control={form.control}
        name='start_date'
        rules={{ required: 'Start date is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Start Date <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? new Date(field.value) : null}
                onChange={val => {
                  field.onChange(val ? val.toISOString().slice(0, 10) : '')
                }}
                placeholder='Select start date'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Start time field (required) */}
      <FormField
        control={form.control}
        name='start_time'
        rules={{ required: 'Start time is required' }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Start Time <span className='text-red-500'>*</span>
            </FormLabel>
            <FormControl>
              <div className='w-full  space-y-2'>
                <div className='relative'>
                  <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                    <Clock8Icon className='size-4' />
                    <span className='sr-only'>Time</span>
                  </div>
                  <Input
                    type='time'
                    id='start-time-picker'
                    step='1'
                    value={field.value || ''}
                    onChange={field.onChange}
                    className='w-full peer appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                  />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* End Date field */}
      <FormField
        control={form.control}
        name='end_date'
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Date</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? new Date(field.value) : null}
                onChange={val => {
                  field.onChange(val ? val.toISOString().slice(0, 10) : '')
                }}
                placeholder='Select end date'
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* End time field */}
      <FormField
        control={form.control}
        name='end_time'
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Time</FormLabel>
            <FormControl>
              <div className='w-full  space-y-2'>
                <div className='relative'>
                  <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                    <Clock8Icon className='size-4' />
                    <span className='sr-only'>Time</span>
                  </div>
                  <Input
                    type='time'
                    id='time-picker'
                    step='1'
                    value={field.value || ''}
                    onChange={field.onChange}
                    className='w-full peer appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                  />
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
