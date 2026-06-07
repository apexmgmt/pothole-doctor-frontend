import { useEffect } from 'react'
import { TaskReminderChannel } from '@/types'
import CustomFormField from '@/components/form/CustomFormField'

interface TaskReminderFieldsProps {
  form: any
  taskReminderChannels: TaskReminderChannel[]
  fieldStyle: string
  labelStyle: string
}

export function TaskReminderFields({ form, taskReminderChannels, fieldStyle, labelStyle }: TaskReminderFieldsProps) {
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
    <div className='grid grid-cols-1 gap-4'>
      {/* SMS Reminder */}
      <div className='space-y-3'>
        <CustomFormField
          type='checkbox'
          name='sms_reminder'
          label='SMS Reminder'
          value={form.watch('sms_reminder') === 1}
          onChange={(val: any) => form.setValue('sms_reminder', val ? 1 : 0)}
          errors={form.formState.errors}
          fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
          labelClassName={labelStyle}
        />

        {smsReminderEnabled === 1 && smsChannel && (
          <div className='ps-27 space-y-3'>
            {/* Customer SMS Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Customer:</p>
              <div className='flex flex-wrap gap-4 [&>div]:w-auto'>
                {smsChannel.times?.map(time => (
                  <CustomFormField
                    key={`sms_customer_${time.id}`}
                    type='checkbox'
                    name={`sms_customer_times.${time.id}`}
                    label={time.label}
                    value={form.watch(`sms_customer_times.${time.id}`) === 1}
                    onChange={(val: any) => handleTimeCheckedChange('sms', 'customer', time.id)(!!val)}
                    errors={form.formState.errors}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {form.formState.errors?.sms_customer_times && (
              <div className='ml-6'>
                <p className='text-red-500 text-xs'>{form.formState.errors.sms_customer_times.message}</p>
              </div>
            )}

            {/* Employee SMS Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Employee:</p>
              <div className='flex flex-wrap gap-4 [&>div]:w-auto'>
                {smsChannel.times?.map(time => (
                  <CustomFormField
                    key={`sms_employee_${time.id}`}
                    type='checkbox'
                    name={`sms_employee_times.${time.id}`}
                    label={time.label}
                    value={form.watch(`sms_employee_times.${time.id}`) === 1}
                    onChange={(val: any) => handleTimeCheckedChange('sms', 'employee', time.id)(!!val)}
                    errors={form.formState.errors}
                  />
                ))}
              </div>
            </div>
            {/* Show error messages below each section */}
            {form.formState.errors?.sms_employee_times && (
              <div className='ml-6'>
                <p className='text-red-500 text-xs'>{form.formState.errors.sms_employee_times.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Email Reminder */}
      <div className='space-y-3'>
        <CustomFormField
          type='checkbox'
          name='email_reminder'
          label='Email Reminder'
          value={form.watch('email_reminder') === 1}
          onChange={(val: any) => form.setValue('email_reminder', val ? 1 : 0)}
          errors={form.formState.errors}
          fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
          labelClassName={labelStyle}
        />

        {emailReminderEnabled === 1 && emailChannel && (
          <div className='ps-27 space-y-3'>
            {/* Customer Email Times */}
            <div>
              <p className='text-sm font-medium mb-2'>Customer:</p>
              <div className='flex flex-wrap gap-4 [&>div]:w-auto'>
                {emailChannel.times?.map(time => (
                  <CustomFormField
                    key={`email_customer_${time.id}`}
                    type='checkbox'
                    name={`email_customer_times.${time.id}`}
                    label={time.label}
                    value={form.watch(`email_customer_times.${time.id}`) === 1}
                    onChange={(val: any) => handleTimeCheckedChange('email', 'customer', time.id)(!!val)}
                    errors={form.formState.errors}
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
              <div className='flex flex-wrap gap-4 [&>div]:w-auto'>
                {emailChannel.times?.map(time => (
                  <CustomFormField
                    key={`email_employee_${time.id}`}
                    type='checkbox'
                    name={`email_employee_times.${time.id}`}
                    label={time.label}
                    value={form.watch(`email_employee_times.${time.id}`) === 1}
                    onChange={(val: any) => handleTimeCheckedChange('email', 'employee', time.id)(!!val)}
                    errors={form.formState.errors}
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
