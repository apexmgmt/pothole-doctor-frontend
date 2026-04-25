import { useEffect } from 'react'

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskReminderChannel } from '@/types'

interface TaskReminderFieldsProps {
  form: any
  taskReminderChannels: TaskReminderChannel[]
}

export function TaskReminderFields({ form, taskReminderChannels }: TaskReminderFieldsProps) {
  const smsChannel = taskReminderChannels.find(channel => channel.type === 'sms')
  const emailChannel = taskReminderChannels.find(channel => channel.type === 'email')

  const smsReminderEnabled = form.watch('sms_reminder')
  const emailReminderEnabled = form.watch('email_reminder')

  // Watch all relevant time fields
  const smsCustomerTimes = form.watch('sms_customer_times')
  const smsEmployeeTimes = form.watch('sms_employee_times')
  const emailCustomerTimes = form.watch('email_customer_times')
  const emailEmployeeTimes = form.watch('email_employee_times')

  // Custom validation effect
  useEffect(() => {
    // Validate SMS reminders
    if (smsReminderEnabled === 1 && smsChannel) {
      const customerTimes = smsCustomerTimes || {}
      const employeeTimes = smsEmployeeTimes || {}
      const customerSelected = Object.values(customerTimes).some(Boolean)
      const employeeSelected = Object.values(employeeTimes).some(Boolean)

      if (!customerSelected) {
        form.setError('sms_customer_times', {
          type: 'manual',
          message: 'Select at least one customer SMS reminder time.'
        })
      } else {
        form.clearErrors('sms_customer_times')
      }

      if (!employeeSelected) {
        form.setError('sms_employee_times', {
          type: 'manual',
          message: 'Select at least one employee SMS reminder time.'
        })
      } else {
        form.clearErrors('sms_employee_times')
      }
    } else {
      form.clearErrors('sms_customer_times')
      form.clearErrors('sms_employee_times')
    }

    // Validate Email reminders
    if (emailReminderEnabled === 1 && emailChannel) {
      const customerTimes = emailCustomerTimes || {}
      const employeeTimes = emailEmployeeTimes || {}
      const customerSelected = Object.values(customerTimes).some(Boolean)
      const employeeSelected = Object.values(employeeTimes).some(Boolean)

      if (!customerSelected) {
        form.setError('email_customer_times', {
          type: 'manual',
          message: 'Select at least one customer Email reminder time.'
        })
      } else {
        form.clearErrors('email_customer_times')
      }

      if (!employeeSelected) {
        form.setError('email_employee_times', {
          type: 'manual',
          message: 'Select at least one employee Email reminder time.'
        })
      } else {
        form.clearErrors('email_employee_times')
      }
    } else {
      form.clearErrors('email_customer_times')
      form.clearErrors('email_employee_times')
    }
  }, [
    smsReminderEnabled,
    emailReminderEnabled,
    smsCustomerTimes,
    smsEmployeeTimes,
    emailCustomerTimes,
    emailEmployeeTimes,
    form,
    smsChannel,
    emailChannel
  ])

  // Helper to clear error if any checkbox is checked
  const handleTimeCheckedChange =
    (type: 'sms' | 'email', role: 'customer' | 'employee', timeId: string) => (checked: boolean) => {
      const fieldName = `${type}_${role}_times`

      form.setValue(`${fieldName}.${timeId}`, checked ? 1 : 0)
      const values = form.getValues(fieldName) || {}

      if (Object.values(values).some(Boolean)) {
        form.clearErrors(fieldName)
      } else {
        form.setError(fieldName, {
          type: 'manual',
          message: `Select at least one ${role} ${type === 'sms' ? 'SMS' : 'Email'} reminder time.`
        })
      }
    }

  return (
    <div className='space-y-4'>
      {/* SMS Reminder */}
      <div className='space-y-3'>
        <FormField
          control={form.control}
          name='sms_reminder'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={checked => field.onChange(checked ? 1 : 0)} />
              </FormControl>
              <FormLabel className='font-normal'>SMS Reminder</FormLabel>
            </FormItem>
          )}
        />

        {smsReminderEnabled === 1 && smsChannel && (
          <div className='ml-6 space-y-3'>
            {/* Customer SMS Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Customer:</p>
              <div className='flex flex-wrap gap-4'>
                {smsChannel.times?.map(time => (
                  <FormField
                    key={`sms_customer_${time.id}`}
                    control={form.control}
                    name={`sms_customer_times.${time.id}`}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={handleTimeCheckedChange('sms', 'customer', time.id)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {smsReminderEnabled === 1 && (
              <div className='ml-6'>
                {form.formState.errors.sms_customer_times && (
                  <p className='text-red-500 text-xs'>{form.formState.errors.sms_customer_times.message}</p>
                )}
              </div>
            )}
            {/* Employee SMS Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Employee:</p>
              <div className='flex flex-wrap gap-4'>
                {smsChannel.times?.map(time => (
                  <FormField
                    key={`sms_employee_${time.id}`}
                    control={form.control}
                    name={`sms_employee_times.${time.id}`}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={handleTimeCheckedChange('sms', 'employee', time.id)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {smsReminderEnabled === 1 && (
              <div className='ml-6'>
                {form.formState.errors.sms_employee_times && (
                  <p className='text-red-500 text-xs'>{form.formState.errors.sms_employee_times.message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Reminder */}
      <div className='space-y-3'>
        <FormField
          control={form.control}
          name='email_reminder'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
              <FormControl>
                <Checkbox checked={!!field.value} onCheckedChange={checked => field.onChange(checked ? 1 : 0)} />
              </FormControl>
              <FormLabel className='font-normal'>Email Reminder</FormLabel>
            </FormItem>
          )}
        />

        {emailReminderEnabled === 1 && emailChannel && (
          <div className='ml-6 space-y-3'>
            {/* Customer Email Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Customer:</p>
              <div className='flex flex-wrap gap-4'>
                {emailChannel.times?.map(time => (
                  <FormField
                    key={`email_customer_${time.id}`}
                    control={form.control}
                    name={`email_customer_times.${time.id}`}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={handleTimeCheckedChange('email', 'customer', time.id)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {emailReminderEnabled === 1 && (
              <div className='ml-6'>
                {form.formState.errors.email_customer_times && (
                  <p className='text-red-500 text-xs'>{form.formState.errors.email_customer_times.message}</p>
                )}
              </div>
            )}
            {/* Employee Email Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Employee:</p>
              <div className='flex flex-wrap gap-4'>
                {emailChannel.times?.map(time => (
                  <FormField
                    key={`email_employee_${time.id}`}
                    control={form.control}
                    name={`email_employee_times.${time.id}`}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={handleTimeCheckedChange('email', 'employee', time.id)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {emailReminderEnabled === 1 && (
              <div className='ml-6'>
                {form.formState.errors.email_employee_times && (
                  <p className='text-red-500 text-xs'>{form.formState.errors.email_employee_times.message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
