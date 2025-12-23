'use client'

import {
  Client,
  CommissionType,
  CommissionTypePayload,
  ReminderPayload,
  Staff,
  Task,
  TaskPayload,
  TaskReminder,
  TaskReminderChannel,
  TaskType
} from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useEffect, useMemo, useState } from 'react'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import TaskService from '@/services/api/tasks.service'
import { MultiSelect, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskDateTimeFields } from './CreateOrEditTaskModal/TaskDateTimeFields'
import { Textarea } from '@/components/ui/textarea'
import { TaskLocationAndCommentFields } from './CreateOrEditTaskModal/TaskLocationAndCommentFields'
import { Checkbox } from '@/components/ui/checkbox'
import { TaskReminderFields } from './CreateOrEditTaskModal/TaskReminderFields'
import { DatePicker } from '@/components/ui/datePicker'

interface CreateOrEditTaskModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  taskDetails?: Task
  onSuccess?: () => void
  staffs: Staff[]
  clients: Client[]
  taskTypes: TaskType[]
  taskReminders: TaskReminder[]
  taskReminderChannels: TaskReminderChannel[]
}

interface FormValues {
  name: string
  client_id: string
  task_type_id?: string
  employee_ids?: string[]
  start_date: string
  start_time?: string
  end_date?: string
  end_time?: string
  sms_reminder: number | 1 | 0
  email_reminder: number | 1 | 0
  location?: string
  comment?: string
  sms_customer_times?: Record<string, number>
  sms_employee_times?: Record<string, number>
  email_customer_times?: Record<string, number>
  email_employee_times?: Record<string, number>
  status?: string
  completed_date?: string
  close_comment?: string
}

const CreateOrEditTaskModal = ({
  mode = 'create',
  open,
  onOpenChange,
  taskId,
  taskDetails,
  onSuccess,
  staffs,
  clients,
  taskTypes,
  taskReminders,
  taskReminderChannels
}: CreateOrEditTaskModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: taskDetails?.name || '',
      client_id: taskDetails?.client_id || '',
      task_type_id: taskDetails?.task_type_id || '',
      employee_ids: taskDetails?.employees?.map(employee => employee.id) || [],
      start_date: taskDetails?.start_date || '',
      start_time: taskDetails?.start_time || '',
      end_date: taskDetails?.end_date || '',
      end_time: taskDetails?.end_time || '',
      sms_reminder: taskDetails?.sms_reminder || 0,
      email_reminder: taskDetails?.email_reminder || 0,
      location: taskDetails?.location || '',
      comment: taskDetails?.comment || '',
      sms_customer_times: {},
      sms_employee_times: {},
      email_customer_times: {},
      email_employee_times: {},
      status: taskDetails?.status || '',
      completed_date: taskDetails?.completed_date || '',
      close_comment: taskDetails?.close_comment || ''
    }
  })

  // Reset form when partnerTypeDetails changes or modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: taskDetails?.name || '',
        client_id: taskDetails?.client_id || '',
        task_type_id: taskDetails?.task_type_id || '',
        employee_ids: taskDetails?.employees?.map(employee => employee.id) || [],
        start_date: taskDetails?.start_date || '',
        start_time: taskDetails?.start_time || '',
        end_date: taskDetails?.end_date || '',
        end_time: taskDetails?.end_time || '',
        sms_reminder: taskDetails?.sms_reminder || 0,
        email_reminder: taskDetails?.email_reminder || 0,
        location: taskDetails?.location || '',
        comment: taskDetails?.comment || '',
        status: taskDetails?.status || '',
        completed_date: taskDetails?.completed_date || '',
        close_comment: taskDetails?.close_comment || ''
      })
    }
  }, [taskDetails, open, form])

  // Memoize addresses for selected client
  const selectedClient = useMemo(
    () => clients.find(c => c.id === form.watch('client_id')),
    [clients, form.watch('client_id')]
  )
  const addressOptions = selectedClient?.addresses || []

  // Find default address value (comma separated)
  const defaultAddress = addressOptions.find(addr => addr.is_default === 1)
    ? [
        addressOptions.find(addr => addr.is_default === 1)?.street_address,
        addressOptions.find(addr => addr.is_default === 1)?.city?.name,
        addressOptions.find(addr => addr.is_default === 1)?.state?.name,
        addressOptions.find(addr => addr.is_default === 1)?.zip_code
      ]
        .filter(Boolean)
        .join(', ')
    : ''

  // When client changes, set location to default address (comma separated) if available
  useEffect(() => {
    if (defaultAddress) {
      form.setValue('location', defaultAddress)
    } else {
      form.setValue('location', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch('client_id')])

  // Watch task_type_id changes
  const selectedTaskTypeId = form.watch('task_type_id')

  // Sync reminder times when task type changes
  useEffect(() => {
    if (selectedTaskTypeId && taskReminders.length > 0) {
      const smsChannel = taskReminderChannels.find(ch => ch.type === 'sms')
      const emailChannel = taskReminderChannels.find(ch => ch.type === 'email')

      // Filter reminders for selected task type
      const taskTypeReminders = taskReminders.filter(reminder => reminder.task_type_id === selectedTaskTypeId)

      // Initialize reminder times objects
      const smsCustomerTimes: Record<string, number> = {}
      const smsEmployeeTimes: Record<string, number> = {}
      const emailCustomerTimes: Record<string, number> = {}
      const emailEmployeeTimes: Record<string, number> = {}

      // Check if any SMS reminder exists for this task type
      let hasSmsReminder = false
      let hasEmailReminder = false

      taskTypeReminders.forEach(reminder => {
        if (reminder.reminder_channel?.type === 'sms') {
          hasSmsReminder = true
          if (reminder.role_type === 'customer') {
            smsCustomerTimes[reminder.reminder_time_id] = reminder.is_enabled
          } else if (reminder.role_type === 'employee') {
            smsEmployeeTimes[reminder.reminder_time_id] = reminder.is_enabled
          }
        } else if (reminder.reminder_channel?.type === 'email') {
          hasEmailReminder = true
          if (reminder.role_type === 'customer') {
            emailCustomerTimes[reminder.reminder_time_id] = reminder.is_enabled
          } else if (reminder.role_type === 'employee') {
            emailEmployeeTimes[reminder.reminder_time_id] = reminder.is_enabled
          }
        }
      })

      // Update form values
      form.setValue('sms_reminder', hasSmsReminder ? 1 : 0)
      form.setValue('email_reminder', hasEmailReminder ? 1 : 0)
      form.setValue('sms_customer_times', smsCustomerTimes)
      form.setValue('sms_employee_times', smsEmployeeTimes)
      form.setValue('email_customer_times', emailCustomerTimes)
      form.setValue('email_employee_times', emailEmployeeTimes)
    } else {
      // Reset reminder fields if no task type is selected
      form.setValue('sms_reminder', 0)
      form.setValue('email_reminder', 0)
      form.setValue('sms_customer_times', {})
      form.setValue('sms_employee_times', {})
      form.setValue('email_customer_times', {})
      form.setValue('email_employee_times', {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskTypeId, taskReminders, taskReminderChannels])

  const onSubmit = async (values: FormValues) => {
    const reminders: ReminderPayload[] = []

    // Build SMS reminders
    if (values.sms_reminder === 1) {
      const smsChannel = taskReminderChannels.find(ch => ch.type === 'sms')
      if (smsChannel) {
        // Customer SMS reminders
        const customerSmsTimeIds = Object.entries(values.sms_customer_times || {})
          .filter(([_, enabled]) => enabled === 1)
          .map(([id, enabled]) => ({ id, is_enabled: enabled }))

        if (customerSmsTimeIds.length > 0) {
          reminders.push({
            reminder_channel_id: smsChannel.id,
            role_type: 'customer',
            task_type_id: values.task_type_id || '',
            reminder_time_ids: customerSmsTimeIds
          })
        }

        // Employee SMS reminders
        const employeeSmsTimeIds = Object.entries(values.sms_employee_times || {})
          .filter(([_, enabled]) => enabled === 1)
          .map(([id, enabled]) => ({ id, is_enabled: enabled }))

        if (employeeSmsTimeIds.length > 0) {
          reminders.push({
            reminder_channel_id: smsChannel.id,
            role_type: 'employee',
            task_type_id: values.task_type_id || '',
            reminder_time_ids: employeeSmsTimeIds
          })
        }
      }
    }

    // Build Email reminders
    if (values.email_reminder === 1) {
      const emailChannel = taskReminderChannels.find(ch => ch.type === 'email')
      if (emailChannel) {
        // Customer Email reminders
        const customerEmailTimeIds = Object.entries(values.email_customer_times || {})
          .filter(([_, enabled]) => enabled === 1)
          .map(([id, enabled]) => ({ id, is_enabled: enabled }))

        if (customerEmailTimeIds.length > 0) {
          reminders.push({
            reminder_channel_id: emailChannel.id,
            role_type: 'customer',
            task_type_id: values.task_type_id || '',
            reminder_time_ids: customerEmailTimeIds
          })
        }

        // Employee Email reminders
        const employeeEmailTimeIds = Object.entries(values.email_employee_times || {})
          .filter(([_, enabled]) => enabled === 1)
          .map(([id, enabled]) => ({ id, is_enabled: enabled }))

        if (employeeEmailTimeIds.length > 0) {
          reminders.push({
            reminder_channel_id: emailChannel.id,
            role_type: 'employee',
            task_type_id: values.task_type_id || '',
            reminder_time_ids: employeeEmailTimeIds
          })
        }
      }
    }

    const payload: TaskPayload = {
      name: values.name,
      client_id: values.client_id,
      task_type_id: values.task_type_id || '',
      employee_ids: values.employee_ids || [],
      start_date: values.start_date || '',
      start_time: values.start_time || '',
      end_date: values.end_date || '',
      end_time: values.end_time || '',
      sms_reminder: values.sms_reminder,
      email_reminder: values.email_reminder,
      location: values.location || '',
      comment: values.comment || '',
      completed_date: values.completed_date || '',
      close_comment: values.close_comment || '',
      status: values.status || '',
      reminders
    }

    if (mode === 'create') {
      try {
        await TaskService.store(payload)
          .then(response => {
            toast.success('Task created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to create task')
          })
      } catch (error) {
        toast.error('Something went wrong while creating the task!')
      }
    } else if (mode === 'edit' && taskId) {
      try {
        await TaskService.update(taskId, payload)
          .then(response => {
            toast.success('Task updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => {
            toast.error(typeof error.message === 'string' ? error.message : 'Failed to update task')
          })
      } catch (error) {
        toast.error('Something went wrong while updating the task!')
      }
    }
  }

  const onCancel = () => {
    form.reset({
      name: taskDetails?.name || ''
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading task...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      description={mode === 'create' ? 'Add a new task to the system' : 'Update task information'}
      maxWidth='4xl'
      disableClose={form.formState.isSubmitting}
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
            className='flex-1'
          >
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Task Name Field */}
            <FormField
              control={form.control}
              name='name'
              rules={{
                required: 'Task name is required',
                minLength: { value: 2, message: 'Task name must be at least 2 characters' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task Name <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter task name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Customer field */}
            <FormField
              control={form.control}
              name='client_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={value => {
                        field.onChange(value)
                        // Reset location when customer changes
                        form.setValue('location', '')
                      }}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Customer' />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.first_name} {client.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task type field */}
            <FormField
              control={form.control}
              name='task_type_id'
              rules={{
                required: 'Task type is required'
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task Type <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Task Type' />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes?.map(taskType => (
                          <SelectItem key={taskType.id} value={taskType.id}>
                            {taskType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Employees field */}
            <FormField
              control={form.control}
              name='employee_ids'
              rules={{
                required: 'Employees are required',
                minLength: { value: 1, message: 'Select at least one employee' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Employees <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={staffs?.map(staff => ({
                        value: staff.id,
                        label: staff.first_name + ' ' + staff.last_name
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder='Select employees...'
                      className='w-full'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* time fields */}
            <TaskDateTimeFields form={form} />
          </div>

          <TaskReminderFields form={form} taskReminderChannels={taskReminderChannels} />
          <TaskLocationAndCommentFields form={form} selectedClient={selectedClient} addressOptions={addressOptions} />

          {/* Edit Mode Only Fields */}
          {mode === 'edit' && (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t'>
              {/* Status field */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='In Progress'>In Progress</SelectItem>
                          <SelectItem value='Completed'>Completed</SelectItem>
                          <SelectItem value='Cancelled'>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Completed Date field */}
              <FormField
                control={form.control}
                name='completed_date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Completed</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : null}
                        onChange={val => {
                          field.onChange(val ? val.toISOString().slice(0, 10) : '')
                        }}
                        placeholder='Select completed date'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Close Comment field */}
              <FormField
                control={form.control}
                name='close_comment'
                render={({ field }) => (
                  <FormItem className='col-span-1 lg:col-span-2'>
                    <FormLabel>Close Comments</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter close comments' rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditTaskModal
