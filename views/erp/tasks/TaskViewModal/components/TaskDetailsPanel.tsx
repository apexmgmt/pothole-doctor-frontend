'use client'

import { KeyboardEventHandler, ReactNode } from 'react'
import { Check, PencilLine, X } from 'lucide-react'

import CustomFormField from '@/components/form/CustomFormField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Client, Staff, Task, TaskType } from '@/types'
import { cn } from '@/lib/utils'
import { formatDateTime, getStatusMeta, STATUS_OPTIONS } from '../helpers'
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

  const addressSelectOptions = addressOptions.map(address => {
    const value = [address.street_address, address.city?.name, address.state?.name, address.zip_code]
      .filter(Boolean)
      .join(', ')

    return {
      value,
      label: `${address.title} - ${value}`
    }
  })

  const staffSelectOptions = staffs.map(staff => ({ value: staff.id, label: `${staff.first_name} ${staff.last_name}` }))
  const taskTypeSelectOptions = taskTypes.map(taskType => ({ value: taskType.id, label: taskType.name }))

  const clientSelectOptions = clients.map(client => ({
    value: client.id,
    label: `${client.first_name} ${client.last_name}`.trim()
  }))

  const statusSelectOptions = STATUS_OPTIONS.map(option => ({ value: option.value, label: option.label }))

  type RowConfig = {
    field: InlineEditableField
    label: string
    align?: 'items-center' | 'items-start'
    renderDisplay: () => ReactNode
    renderEditor: () => ReactNode
  }

  const renderInlineActions = (onSave: () => void) => (
    <div className='absolute -bottom-6 right-1 z-10 flex gap-2'>
      <Button
        type='button'
        variant='primary'
        size='icon'
        className='size-6 rounded-xs shadow-sm shadow-[#929292]/40 bg-white hover:bg-white/90 text-black'
        onClick={onSave}
        aria-label='Save'
      >
        <Check className='size-4' />
      </Button>
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='size-6 rounded-xs shadow-sm shadow-[#929292]/40'
        onClick={cancelInlineEdit}
        aria-label='Cancel'
      >
        <X className='size-4' />
      </Button>
    </div>
  )

  const renderInlineEditor = (
    content: ReactNode,
    onSave: () => void,
    options?: { className?: string; onKeyDown?: KeyboardEventHandler<HTMLDivElement> }
  ) => (
    <div data-inline-editor className={cn('relative', options?.className)} onKeyDown={options?.onKeyDown}>
      {content}
      {renderInlineActions(onSave)}
    </div>
  )

  const renderEditableDisplay = (
    field: InlineEditableField,
    content: ReactNode,
    startValue?: string,
    align: 'items-center' | 'items-start' = 'items-center'
  ) => (
    <div
      className={cn(
        'group flex justify-between gap-2 hover:bg-accent/40 px-2.5 py-1.5 rounded-md transition-colors duration-100',
        align,
        canEditTask && 'cursor-pointer'
      )}
      onClick={() => startInlineEdit(field, startValue)}
    >
      <div className='flex-1'>{content}</div>
      {canEditTask && (
        <PencilLine
          className={cn(
            'size-4 text-white opacity-0 transition-opacity group-hover:opacity-100',
            align === 'items-start' && 'mt-0.5'
          )}
        />
      )}
    </div>
  )

  const rows: RowConfig[] = [
    {
      field: 'status',
      label: 'Status',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='combobox'
            name='status'
            placeholder='Select status'
            value={editingValue || task?.status || ''}
            autoFocus
            selectOptions={statusSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('status')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'status',
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>,
          task?.status || ''
        )
    },
    {
      field: 'task_type_id',
      label: 'Task Type',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='combobox'
            name='task_type_id'
            placeholder='Select Task Type'
            value={editingValue || task?.task_type_id || ''}
            autoFocus
            selectOptions={taskTypeSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('task_type_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'task_type_id',
          <p className='text-sm leading-none'>{task?.task_type?.name || '-'}</p>,
          task?.task_type_id || ''
        )
    },
    {
      field: 'client_id',
      label: 'Customer',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='combobox'
            name='client_id'
            placeholder='Select Customer'
            value={editingValue || task?.client_id || ''}
            autoFocus
            selectOptions={clientSelectOptions}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('client_id')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'client_id',
          <p className='text-sm leading-none'>
            {[task?.client?.first_name, task?.client?.last_name].filter(Boolean).join(' ') || '-'}
          </p>,
          task?.client_id || ''
        )
    },
    {
      field: 'location',
      label: 'Location',
      align: 'items-start',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='select'
            name='location'
            placeholder={addressSelectOptions.length ? 'Select Address' : 'No addresses found'}
            value={editingValue || task?.location || ''}
            autoFocus
            selectOptions={addressSelectOptions}
            disabled={addressSelectOptions.length === 0}
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
            className='whitespace-normal text-left leading-snug h-auto!'
          />,
          () => saveInlineField('location')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'location',
          <p className='text-sm'>{task?.location || '-'}</p>,
          task?.location || '',
          'items-start'
        )
    },
    {
      field: 'start_date',
      label: 'Start Date',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='start_date'
            placeholder='Select start date'
            value={editingValue || task?.start_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('start_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'start_date',
          <p className='text-sm leading-none'>{formatDate(task?.start_date ?? null) || '-'}</p>,
          task?.start_date || ''
        )
    },
    {
      field: 'start_time',
      label: 'Start Time',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='time'
            name='start_time'
            value={editingValue || task?.start_time || ''}
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('start_time'),
          {
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('start_time')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'start_time',
          <p className='text-sm leading-none'>{task?.start_time || '-'}</p>,
          task?.start_time || ''
        )
    },
    {
      field: 'end_date',
      label: 'End Date',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='end_date'
            placeholder='Select end date'
            value={editingValue || task?.end_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('end_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'end_date',
          <p className='text-sm leading-none'>{formatDate(task?.end_date ?? null) || '-'}</p>,
          task?.end_date || ''
        )
    },
    {
      field: 'end_time',
      label: 'End Time',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='time'
            name='end_time'
            value={editingValue || task?.end_time || ''}
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('end_time'),
          {
            onKeyDown: event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('end_time')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'end_time',
          <p className='text-sm leading-none'>{task?.end_time || '-'}</p>,
          task?.end_time || ''
        )
    },
    {
      field: 'employee_ids',
      label: 'Assigned To',
      align: 'items-start',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='multiselect-searchable'
            name='employee_ids'
            placeholder='Select employees...'
            selectOptions={staffSelectOptions}
            value={editingEmployeeIds}
            autoFocus
            onChange={value => {
              const nextValue = Array.isArray(value) ? value.map(item => String(item)) : []

              setEditingEmployeeIds(nextValue)
            }}
          />,
          () => saveInlineField('employee_ids', editingEmployeeIds)
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'employee_ids',
          <div className='flex flex-wrap items-center gap-1'>
            {task?.employees?.length ? (
              task.employees.map(employee => (
                <Badge key={employee.id} variant='outline' className={cn(canEditTask && 'cursor-pointer')}>
                  {employee.first_name} {employee.last_name}
                </Badge>
              ))
            ) : (
              <p className='text-sm leading-none'>-</p>
            )}
          </div>,
          undefined,
          'items-start'
        )
    },
    {
      field: 'completed_date',
      label: 'Completed Date',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='datepicker'
            name='completed_date'
            placeholder='Select completed date'
            value={editingValue || task?.completed_date || ''}
            autoFocus
            onChange={value => {
              const nextValue = String(value ?? '')

              setEditingValue(nextValue)
            }}
          />,
          () => saveInlineField('completed_date')
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'completed_date',
          <p className='text-sm leading-none'>{formatDate(task?.completed_date ?? null) || '-'}</p>,
          task?.completed_date || ''
        )
    },
    {
      field: 'close_comment',
      label: 'Close Comment',
      renderEditor: () =>
        renderInlineEditor(
          <CustomFormField
            type='textarea'
            name='close_comment'
            value={editingValue}
            className='min-h-20'
            autoFocus
            onChange={value => setEditingValue(String(value ?? ''))}
          />,
          () => saveInlineField('close_comment'),
          {
            onKeyDown: event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('close_comment')
              }

              if (event.key === 'Escape') {
                event.preventDefault()
                cancelInlineEdit()
              }
            }
          }
        ),
      renderDisplay: () =>
        renderEditableDisplay(
          'close_comment',
          <p className='text-sm leading-none whitespace-pre-wrap'>{task?.close_comment || '-'}</p>,
          task?.close_comment || ''
        )
    }
  ]

  return (
    <div className='space-y-4'>
      <div className='rounded-md border border-border p-4'>
        <div className='flex items-center justify-between gap-2'>
          <h4 className='text-sm font-semibold'>Details</h4>
        </div>

        <div className='flex flex-col gap-1 mt-3'>
          {rows.map(row => (
            <div
              key={row.field}
              className={cn('grid grid-cols-[116px_minmax(0,_1fr)] gap-2', row.align ?? 'items-center')}
            >
              <Label className='text-sm text-muted-foreground'>{row.label}:</Label>
              {editingField === row.field ? row.renderEditor() : row.renderDisplay()}
            </div>
          ))}

          {task?.created_by?.first_name && (
            <div className='grid grid-cols-[116px_minmax(0,_1fr)] gap-2 items-center'>
              <Label className='text-sm text-muted-foreground'>Created By:</Label>
              <p className='text-sm leading-none px-2.5 py-1.5'>
                {[task?.created_by?.first_name, task?.created_by?.last_name].filter(Boolean).join(' ') || '-'}
              </p>
            </div>
          )}

          <div className='grid grid-cols-[116px_minmax(0,_1fr)] gap-2 items-center'>
            <Label className='text-sm text-muted-foreground'>Created At:</Label>
            <p className='text-sm leading-none px-2.5 py-1.5'>{formatDateTime(task?.created_at)}</p>
          </div>

          <div className='grid grid-cols-[116px_minmax(0,_1fr)] gap-2 items-center'>
            <Label className='text-sm text-muted-foreground'>Updated At:</Label>
            <p className='text-sm leading-none px-2.5 py-1.5'>{formatDateTime(task?.updated_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
