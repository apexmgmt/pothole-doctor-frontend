'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Client, ReminderPayload, Staff, Task, TaskPayload, TaskReminder, TaskReminderChannel, TaskType } from '@/types'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import TaskService from '@/services/api/tasks/tasks.service'
import ProposalTaskService from '@/services/api/estimates/proposal-tasks.service'
import InvoiceTaskService from '@/services/api/invoices/invoice-tasks.service'
import { TaskReminderFields } from './CreateOrEditTaskModal/TaskReminderFields'
import TipTapRichTextEditor from '@/components/erp/common/editor/TipTapRichTextEditor'
import CustomFormField from '@/components/form/CustomFormField'
import { addDays } from '@/utils/formatTime'

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

  /** When provided, task is created under this proposal via ProposalTaskService */
  proposalId?: string

  /** When provided, task is created under this invoice via InvoiceTaskService */
  invoiceId?: string

  /** When provided, pre-selects and locks the customer field */
  defaultClientId?: string
}

interface FormValues {
  name: string
  client_id: string
  task_type_id?: string
  employee_ids?: string[]
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  sms_reminder: number | 1 | 0
  email_reminder: number | 1 | 0
  location?: string
  description?: string
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
  taskReminderChannels,
  proposalId,
  invoiceId,
  defaultClientId
}: CreateOrEditTaskModalProps) => {
  const [descriptionHtml, setDescriptionHtml] = useState<string>('')

  // Skip reminder sync on initial edit load so existing task_reminder_setting values are preserved
  const skipReminderSync = useRef(false)

  const form = useForm<FormValues>({
    defaultValues: {
      name: taskDetails?.name || '',
      client_id: taskDetails?.client_id || defaultClientId || '',
      task_type_id: taskDetails?.task_type_id || '',
      employee_ids: taskDetails?.employees?.map(employee => employee.id) || [],
      start_date: taskDetails?.start_date || '',
      start_time: taskDetails?.start_time || '',
      end_date: taskDetails?.end_date || '',
      end_time: taskDetails?.end_time || '',
      sms_reminder: taskDetails?.sms_reminder || 0,
      email_reminder: taskDetails?.email_reminder || 0,
      location: taskDetails?.location || '',
      description: taskDetails?.description || '',
      sms_customer_times: {},
      sms_employee_times: {},
      email_customer_times: {},
      email_employee_times: {},
      status: taskDetails?.status || '',
      completed_date: taskDetails?.completed_date || '',
      close_comment: taskDetails?.close_comment || ''
    }
  })

  const {
    watch,
    setValue,
    register,
    control,
    formState: { errors }
  } = form

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  // Reset form when taskDetails changes or modal opens
  useEffect(() => {
    if (open) {
      // Build reminder times from existing task_reminder_setting (edit mode)
      const smsCustomerTimes: Record<string, number> = {}
      const smsEmployeeTimes: Record<string, number> = {}
      const emailCustomerTimes: Record<string, number> = {}
      const emailEmployeeTimes: Record<string, number> = {}

      if (taskDetails?.task_reminder_setting?.length) {
        taskDetails.task_reminder_setting.forEach(setting => {
          const channelType = setting.reminder_channel?.type

          if (channelType === 'sms') {
            if (setting.role_type === 'customer') {
              smsCustomerTimes[setting.reminder_time_id] = setting.is_enabled
            } else if (setting.role_type === 'employee') {
              smsEmployeeTimes[setting.reminder_time_id] = setting.is_enabled
            }
          } else if (channelType === 'email') {
            if (setting.role_type === 'customer') {
              emailCustomerTimes[setting.reminder_time_id] = setting.is_enabled
            } else if (setting.role_type === 'employee') {
              emailEmployeeTimes[setting.reminder_time_id] = setting.is_enabled
            }
          }
        })

        // Mark to skip the task_type_id useEffect overwrite on initial load
        skipReminderSync.current = true
      }

      form.reset({
        name: taskDetails?.name || '',
        client_id: taskDetails?.client_id || defaultClientId || '',
        task_type_id: taskDetails?.task_type_id || '',
        employee_ids: taskDetails?.employees?.map(employee => employee.id) || [],
        start_date: taskDetails?.start_date || '',
        start_time: taskDetails?.start_time || '',
        end_date: taskDetails?.end_date || '',
        end_time: taskDetails?.end_time || '',
        sms_reminder: taskDetails?.sms_reminder || 0,
        email_reminder: taskDetails?.email_reminder || 0,
        location: taskDetails?.location || '',
        description: taskDetails?.description || '',
        sms_customer_times: smsCustomerTimes,
        sms_employee_times: smsEmployeeTimes,
        email_customer_times: emailCustomerTimes,
        email_employee_times: emailEmployeeTimes,
        status: taskDetails?.status || '',
        completed_date: taskDetails?.completed_date || '',
        close_comment: taskDetails?.close_comment || ''
      })

      // Initialise rich-text editor from saved HTML
      setDescriptionHtml(taskDetails?.description || '')
    } else {
      setDescriptionHtml('')
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
  }, [form.watch('client_id')])

  // Watch task_type_id changes
  const selectedTaskTypeId = form.watch('task_type_id')

  // Sync reminder times when task type changes
  useEffect(() => {
    // Skip on initial edit load to preserve existing task_reminder_setting values
    if (skipReminderSync.current) {
      skipReminderSync.current = false

      return
    }

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
      description: descriptionHtml,
      completed_date: values.completed_date || '',
      close_comment: values.close_comment || '',
      status: values.status || '',
      reminders
    }

    const handleApiError = (error: any, fallbackMessage: string) => {
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : String(messages)

          form.setError(field as keyof FormValues, { type: 'server', message: msg })
        })

        if (error.message) {
          toast.error(error.message)
        }
      } else {
        toast.error(typeof error.message === 'string' ? error.message : fallbackMessage)
      }
    }

    if (mode === 'create') {
      try {
        const storeCall = proposalId
          ? ProposalTaskService.store(proposalId, payload)
          : invoiceId
            ? InvoiceTaskService.store(invoiceId, payload)
            : TaskService.store(payload)

        await storeCall
          .then(() => {
            toast.success('Task created successfully')
            form.reset()
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => handleApiError(error, 'Failed to create task'))
      } catch (error) {
        toast.error('Something went wrong while creating the task!')
      }
    } else if (mode === 'edit' && taskId) {
      try {
        const updateCall = proposalId
          ? ProposalTaskService.update(proposalId, taskId, payload)
          : invoiceId
            ? InvoiceTaskService.update(invoiceId, taskId, payload)
            : TaskService.update(taskId, payload)

        await updateCall
          .then(() => {
            toast.success('Task updated successfully')
            onOpenChange(false)
            onSuccess?.()
          })
          .catch(error => handleApiError(error, 'Failed to update task'))
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

  const fieldStyle = 'grid grid-cols-[100px_minmax(0,_1fr)]'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      isLoading={form.formState.isSubmitting}
      loadingMessage='Loading task...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      description={mode === 'create' ? 'Add a new task to the system' : 'Update task information'}
      disableClose={form.formState.isSubmitting}
      className='sm:max-w-252!'
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
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mr-0.5'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3'>
            {/* Task Name Field */}
            <CustomFormField
              name='name'
              type='text'
              label='Task Name'
              placeholder='Enter task name'
              control={control}
              register={register}
              rules={{
                required: 'Task name is required',
                minLength: { value: 2, message: 'Task name must be at least 2 characters' }
              }}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
            {/* Task type field */}
            <CustomFormField
              name='task_type_id'
              type='select'
              label='Task Type'
              placeholder='Select task type'
              control={control}
              register={register}
              rules={{
                required: 'Task type is required'
              }}
              selectOptions={taskTypes?.map(taskType => ({
                value: taskType.id,
                label: taskType.name
              }))}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Description Field */}
            <div className={`sm:col-span-2 gap-x-2 ${fieldStyle}`}>
              <label className={`w-full text-xs font-medium flex ${labelStyle}`}>Description</label>
              <TipTapRichTextEditor
                value={descriptionHtml}
                onChange={setDescriptionHtml}
                placeholder='Enter task description'
              />
            </div>

            {/* Customer field */}
            <CustomFormField
              name='client_id'
              type='select'
              label='Customer'
              placeholder='Select customer'
              control={control}
              register={register}
              rules={{
                required: 'Customer is required'
              }}
              selectOptions={clients.map(client => ({
                value: client.id,
                label: `${client.first_name} ${client.last_name}`
              }))}
              onChange={() => setValue('location', '')}
              disabled={!!defaultClientId}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Employees field */}
            <CustomFormField
              name='employee_ids'
              type='multiselect-searchable'
              label='Employees'
              placeholder='Select employees...'
              control={control}
              register={register}
              rules={{
                required: 'Employees are required',
                minLength: { value: 1, message: 'Select at least one employee' }
              }}
              selectOptions={staffs?.map(staff => ({
                value: staff.id,
                label: staff.first_name + ' ' + staff.last_name
              }))}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Start date field */}
            <CustomFormField
              name='start_date'
              type='datepicker'
              label='Start Date'
              placeholder='Select start date'
              maxDate={endDate ? addDays(endDate, -1) : undefined}
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* Start time field */}
            <CustomFormField
              name='start_time'
              type='time'
              label='Start Time'
              placeholder='Select start time'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* End Date field */}
            <CustomFormField
              name='end_date'
              type='datepicker'
              label='End Date'
              placeholder='Select end date'
              minDate={startDate ? addDays(startDate, 1) : undefined}
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />

            {/* End time field */}
            <CustomFormField
              name='end_time'
              type='time'
              label='End Time'
              placeholder='Select end time'
              control={control}
              register={register}
              errors={errors}
              fieldClassName={fieldStyle}
              labelClassName={labelStyle}
            />
          </div>

          <TaskReminderFields
            form={form}
            taskReminderChannels={taskReminderChannels}
            fieldStyle={fieldStyle}
            labelStyle={labelStyle}
          />

          <CustomFormField
            name='location'
            label='Event Location'
            type='select'
            placeholder={selectedClient ? 'Select address' : 'Select customer first'}
            control={control}
            register={register}
            selectOptions={
              addressOptions.length === 0
                ? [{ value: '_', label: 'No addresses found', disabled: true }]
                : addressOptions.map(address => {
                    const value = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
                      .filter(Boolean)
                      .join(', ')

                    return {
                      label: `${address.title} - ${value}`,
                      value: value
                    }
                  })
            }
            disabled={!selectedClient}
            errors={errors}
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
          />

          {/* Edit Mode Only Fields */}
          {mode === 'edit' && (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 pt-4 border-t border-border'>
              {/* Status field */}
              <CustomFormField
                name='status'
                type='select'
                label='Status'
                placeholder='Select status'
                control={control}
                register={register}
                selectOptions={[
                  { value: 'backlog', label: 'Backlog' },
                  { value: 'to-do', label: 'To Do' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              {/* Completed Date field */}
              <CustomFormField
                name='completed_date'
                type='datepicker'
                label='Date Completed'
                placeholder='Select completed date'
                register={register}
                control={control}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              {/* Close Comment field */}
              <CustomFormField
                name='close_comment'
                type='textarea'
                label='Close Comments'
                placeholder='Enter close comments'
                register={register}
                control={control}
                errors={errors}
                fieldClassName={`col-span-1 lg:col-span-2 ${fieldStyle}`}
                labelClassName={labelStyle}
              />
            </div>
          )}
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditTaskModal
