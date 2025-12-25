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
                            onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

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
                            onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
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
                            onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

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
                            onCheckedChange={checked => field.onChange(checked ? 1 : 0)}
                          />
                        </FormControl>
                        <FormLabel className='font-normal text-sm'>{time.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
