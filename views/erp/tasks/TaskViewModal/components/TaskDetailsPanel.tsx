'use client'

import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Client, Staff, Task, TaskType } from '@/types'
import { cn } from '@/lib/utils'
import { formatDateTime, getStatusMeta, parseDateString, STATUS_OPTIONS } from '../helpers'
import { InlineEditableField } from '../types'
import { formatDate } from '@/utils/date'

interface TaskDetailsPanelProps {
  task: Task | null
  taskId?: string
  canEditTask: boolean
  isLoadingTask: boolean
  onEditTask?: (id: string) => void
  clients: Client[]
  staffs: Staff[]
  taskTypes: TaskType[]
  editingField: InlineEditableField | null
  editingValue: string
  setEditingValue: (value: string) => void
  editingEmployeeIds: string[]
  setEditingEmployeeIds: (value: string[]) => void
  startInlineEdit: (field: InlineEditableField, value?: string) => void
  saveInlineField: (field: InlineEditableField, explicitValue?: string | string[]) => void
  cancelInlineEdit: () => void
}

export default function TaskDetailsPanel({
  task,
  taskId,
  canEditTask,
  isLoadingTask,
  onEditTask,
  clients,
  staffs,
  taskTypes,
  editingField,
  editingValue,
  setEditingValue,
  editingEmployeeIds,
  setEditingEmployeeIds,
  startInlineEdit,
  saveInlineField,
  cancelInlineEdit
}: TaskDetailsPanelProps) {
  const statusMeta = getStatusMeta(task?.status)
  const selectedClient = clients.find(client => client.id === task?.client_id)
  const addressOptions = selectedClient?.addresses || task?.client?.addresses || []

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-border p-4 space-y-3'>
        <div className='flex items-center justify-between gap-2'>
          <h4 className='text-sm font-semibold'>Details</h4>
          {canEditTask && taskId && onEditTask ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onEditTask(taskId)}
              disabled={isLoadingTask}
            >
              Edit
            </Button>
          ) : null}
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Status : </Label>
          {editingField === 'status' ? (
            <div className='flex-1' data-inline-editor>
              <Select
                value={editingValue || task?.status || ''}
                onOpenChange={open => {
                  if (!open) cancelInlineEdit()
                }}
                onValueChange={value => {
                  setEditingValue(value)
                  saveInlineField('status', value)
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Badge
              variant={statusMeta.variant}
              className={cn(canEditTask && 'cursor-pointer')}
              onClick={() => startInlineEdit('status', task?.status || '')}
            >
              {statusMeta.label}
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Task Type : </Label>
          {editingField === 'task_type_id' ? (
            <div className='flex-1' data-inline-editor>
              <Select
                value={editingValue || task?.task_type_id || ''}
                onOpenChange={open => {
                  if (!open) cancelInlineEdit()
                }}
                onValueChange={value => {
                  setEditingValue(value)
                  saveInlineField('task_type_id', value)
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Task Type' />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map(taskType => (
                    <SelectItem key={taskType.id} value={taskType.id}>
                      {taskType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p
              className={cn('text-sm flex-1', canEditTask && 'cursor-pointer')}
              onClick={() => startInlineEdit('task_type_id', task?.task_type_id || '')}
            >
              {task?.task_type?.name || '-'}
            </p>
          )}
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Customer : </Label>
          {editingField === 'client_id' ? (
            <div className='flex-1' data-inline-editor>
              <Select
                value={editingValue || task?.client_id || ''}
                onOpenChange={open => {
                  if (!open) cancelInlineEdit()
                }}
                onValueChange={value => {
                  setEditingValue(value)
                  saveInlineField('client_id', value)
                }}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Customer' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p
              className={cn('text-sm flex-1', canEditTask && 'cursor-pointer')}
              onClick={() => startInlineEdit('client_id', task?.client_id || '')}
            >
              {[task?.client?.first_name, task?.client?.last_name].filter(Boolean).join(' ') || '-'}
            </p>
          )}
        </div>

        <div className='flex items-start gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Location : </Label>
          {editingField === 'location' ? (
            <div className='flex-1' data-inline-editor>
              <Select
                value={editingValue || task?.location || ''}
                onOpenChange={open => {
                  if (!open) cancelInlineEdit()
                }}
                onValueChange={value => {
                  setEditingValue(value)
                  saveInlineField('location', value)
                }}
                disabled={addressOptions.length === 0}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select Address' />
                </SelectTrigger>
                <SelectContent className='w-(--radix-select-trigger-width) max-w-[calc(100vw-2rem)]'>
                  {addressOptions.length === 0 ? (
                    <div className='px-3 py-2 text-muted-foreground text-sm'>No addresses found</div>
                  ) : (
                    addressOptions.map(address => {
                      const value = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
                        .filter(Boolean)
                        .join(', ')

                      return (
                        <SelectItem key={address.id} value={value} className='whitespace-normal wrap-break-words'>
                          {address.title} - {value}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p
              className={cn('text-sm flex-1', canEditTask && 'cursor-pointer')}
              onClick={() => startInlineEdit('location', task?.location || '')}
            >
              {task?.location || '-'}
            </p>
          )}
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Start Date : </Label>
          <div className='flex-1'>
            {editingField === 'start_date' ? (
              <div data-inline-editor>
                <DatePicker
                  value={editingValue ? parseDateString(editingValue) : parseDateString(task?.start_date) || null}
                  onChange={value => {
                    const next = value ? format(value, 'yyyy-MM-dd') : ''

                    saveInlineField('start_date', next)
                  }}
                  placeholder='Select start date'
                />
              </div>
            ) : (
              <p
                className={cn('text-sm', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('start_date', task?.start_date || '')}
              >
                {formatDate(task?.start_date ?? null) || '-'}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Start Time : </Label>
          <div className='flex-1'>
            {editingField === 'start_time' ? (
              <Input
                data-inline-editor
                type='time'
                step='1'
                value={editingValue || task?.start_time || ''}
                autoFocus
                onChange={event => setEditingValue(event.target.value)}
                onBlur={() => {
                  saveInlineField('start_time')
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    saveInlineField('start_time')
                  }

                  if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelInlineEdit()
                  }
                }}
              />
            ) : (
              <p
                className={cn('text-sm', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('start_time', task?.start_time || '')}
              >
                {task?.start_time || '-'}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>End Date : </Label>
          <div className='flex-1'>
            {editingField === 'end_date' ? (
              <div data-inline-editor>
                <DatePicker
                  value={editingValue ? parseDateString(editingValue) : parseDateString(task?.end_date) || null}
                  onChange={value => {
                    const next = value ? format(value, 'yyyy-MM-dd') : ''

                    saveInlineField('end_date', next)
                  }}
                  placeholder='Select end date'
                />
              </div>
            ) : (
              <p
                className={cn('text-sm', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('end_date', task?.end_date || '')}
              >
                {formatDate(task?.end_date ?? null) || '-'}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>End Time : </Label>
          <div className='flex-1'>
            {editingField === 'end_time' ? (
              <Input
                data-inline-editor
                type='time'
                step='1'
                value={editingValue || task?.end_time || ''}
                autoFocus
                onChange={event => setEditingValue(event.target.value)}
                onBlur={() => {
                  saveInlineField('end_time')
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    saveInlineField('end_time')
                  }

                  if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelInlineEdit()
                  }
                }}
              />
            ) : (
              <p
                className={cn('text-sm', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('end_time', task?.end_time || '')}
              >
                {task?.end_time || '-'}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Assigned To : </Label>
          {editingField === 'employee_ids' ? (
            <div className='flex-1' data-inline-editor>
              <MultiSelect
                options={staffs.map(staff => ({ value: staff.id, label: `${staff.first_name} ${staff.last_name}` }))}
                selected={editingEmployeeIds}
                onChange={setEditingEmployeeIds}
                placeholder='Select employees...'
                className='w-full'
              />
              <div className='mt-2 flex justify-end gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={cancelInlineEdit}>
                  Cancel
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => {
                    saveInlineField('employee_ids', editingEmployeeIds)
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex flex-1 flex-wrap gap-1'>
              {task?.employees?.length ? (
                task.employees.map(employee => (
                  <Badge
                    key={employee.id}
                    variant='outline'
                    className={cn(canEditTask && 'cursor-pointer')}
                    onClick={() => startInlineEdit('employee_ids')}
                  >
                    {employee.first_name} {employee.last_name}
                  </Badge>
                ))
              ) : (
                <p
                  className={cn('text-sm', canEditTask && 'cursor-pointer')}
                  onClick={() => startInlineEdit('employee_ids')}
                >
                  -
                </p>
              )}
            </div>
          )}
        </div>

        {task?.created_by?.first_name && (
          <div className='flex items-center gap-3 flex-row '>
            <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Created By : </Label>
            <p
              className={cn('text-sm flex-1', '')}
            >
              {[task?.created_by?.first_name, task?.created_by?.last_name].filter(Boolean).join(' ') || '-'}
            </p>
          </div>
        )}

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Created At : </Label>
          <p className='text-sm flex-1'>{formatDateTime(task?.created_at)}</p>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Updated At : </Label>
          <p className='text-sm flex-1'>{formatDateTime(task?.updated_at)}</p>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Completed Date : </Label>
          <div className='flex-1'>
            {editingField === 'completed_date' ? (
              <div data-inline-editor>
                <DatePicker
                  value={editingValue ? parseDateString(editingValue) : parseDateString(task?.completed_date) || null}
                  onChange={value => {
                    const next = value ? format(value, 'yyyy-MM-dd') : ''

                    saveInlineField('completed_date', next)
                  }}
                  placeholder='Select completed date'
                />
              </div>
            ) : (
              <p
                className={cn('text-sm', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('completed_date', task?.completed_date || '')}
              >
                {formatDate(task?.completed_date ?? null) || '-'}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3 flex-row '>
          <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Close Comment : </Label>
          {editingField === 'close_comment' ? (
            <div className='flex-1' data-inline-editor>
              <Textarea
                value={editingValue}
                autoFocus
                onChange={event => setEditingValue(event.target.value)}
                onBlur={event => {
                  saveInlineField('close_comment', event.target.value)
                }}
                onKeyDown={event => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault()
                    saveInlineField('close_comment')
                  }

                  if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelInlineEdit()
                  }
                }}
                className='min-h-20'
              />
            </div>
          ) : (
            <p
              className={cn('text-sm flex-1 whitespace-pre-wrap', canEditTask && 'cursor-pointer')}
              onClick={() => startInlineEdit('close_comment', task?.close_comment || '')}
            >
              {task?.close_comment || '-'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
