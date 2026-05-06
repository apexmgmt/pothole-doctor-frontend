import { format, isAfter, parse } from 'date-fns'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'

interface TaskDateTimeFieldsProps {
  form: any
}

function parseDateString(dateString: string | null | undefined) {
  return dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : null
}

export function TaskDateTimeFields({ form }: TaskDateTimeFieldsProps) {
  return (
    <>
      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Start date field (required) */}
        <FormField
          control={form.control}
          name='start_date'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Start Date
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? parseDateString(field.value) : null}
                  onChange={val => {
                    field.onChange(val ? format(val, 'yyyy-MM-dd') : '')
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Start Time
              </FormLabel>
              <FormControl>
                <div className='w-full space-y-2'>
                  <div className='relative'>
                    <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                      <span className='sr-only'>Time</span>
                    </div>
                    <Input
                      type='time'
                      id='start-time-picker'
                      step='1'
                      value={field.value || ''}
                      onChange={field.onChange}
                      className='w-full peer'
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className='grid gap-4 mt-4 sm:grid-cols-2'>
        {/* End Date field */}
        <FormField
          control={form.control}
          name='end_date'
          rules={{
            validate: value => {
              const startDate = form.getValues('start_date')

              if (!value || !startDate) {
                return true
              }

              const parsedStartDate = parseDateString(startDate)
              const parsedEndDate = parseDateString(value)

              if (parsedStartDate && parsedEndDate && !isAfter(parsedEndDate, parsedStartDate)) {
                return 'End date must be after start date'
              }

              return true
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? parseDateString(field.value) : null}
                  onChange={val => {
                    field.onChange(val ? format(val, 'yyyy-MM-dd') : '')
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
                <div className='w-full space-y-2'>
                  <div className='relative'>
                    <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                      <span className='sr-only'>Time</span>
                    </div>
                    <Input
                      type='time'
                      id='time-picker'
                      step='1'
                      value={field.value || ''}
                      onChange={field.onChange}
                      className='w-full peer'
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )
}
