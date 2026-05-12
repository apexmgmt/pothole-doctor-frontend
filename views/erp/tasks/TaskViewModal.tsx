'use client'

import { useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/datePicker'
import TipTapRichTextEditor from '@/components/erp/common/editor/TipTapRichTextEditor'
import TaskService from '@/services/api/tasks/tasks.service'
import TaskCommentService from '@/services/api/tasks/task-comments.service'
import { Client, ReminderPayload, Task, TaskComment, TaskPayload, TaskType } from '@/types'
import { getAuthUser } from '@/utils/auth'
import { generateFileUrl } from '@/utils/utility'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import TaskDocuments from './documents/TaskDocuments'
import { format, parse } from 'date-fns'

interface TaskViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  canEditTask?: boolean
  onEditTask?: (id: string) => void
  clients?: Client[]
  taskTypes?: TaskType[]
  onTaskStatusChanged?: (taskId: string, newStatus: string, newOrder: number, updatedTask?: Task) => void
}

type InlineEditableField =
  | 'name'
  | 'location'
  | 'start_date'
  | 'start_time'
  | 'end_date'
  | 'end_time'
  | 'completed_date'
  | 'close_comment'
  | 'client_id'
  | 'task_type_id'
  | 'status'

const STATUS_STYLES: Record<
  string,
  { label: string; variant: 'secondary' | 'info' | 'destructive' | 'success' | 'outline' | 'default' }
> = {
  backlog: { label: 'Backlog', variant: 'secondary' },
  'to-do': { label: 'To Do', variant: 'secondary' },
  'in-progress': { label: 'In Progress', variant: 'info' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'outline' }
}

const getStatusMeta = (status?: string) => {
  const normalized = (status || '').toString().trim().toLowerCase().replace(/\s+/g, '-')

  return STATUS_STYLES[normalized] || { label: status || '-', variant: 'default' as const }
}

const getDisplayName = (comment: TaskComment) => {
  const first = comment.user?.first_name || ''
  const last = comment.user?.last_name || ''
  const fullName = `${first} ${last}`.trim()

  return fullName || comment.user?.name || 'Unknown User'
}

const getAvatarUrl = (comment: TaskComment) => {
  const raw = comment.user?.userable?.profile_picture || comment.user?.profile_picture || ''

  if (!raw) return ''

  return generateFileUrl(raw)
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'U'

  return `${parts[0][0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

const getPlainTextFromHtml = (value: string) => {
  if (!value) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(value, 'text/html')

  return (doc.body.textContent || '').replace(/\u00A0/g, ' ').trim()
}

const sortCommentsByUpdatedAt = (items: TaskComment[]) => {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at || 0).getTime()
    const bTime = new Date(b.updated_at || b.created_at || 0).getTime()

    return aTime - bTime
  })
}

const parseDateString = (dateString: string | null | undefined) => {
  return dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : null
}

const buildTaskReminderPayload = (task: Task): ReminderPayload[] => {
  const groupedReminders = new Map<string, ReminderPayload>()

  ;(task.task_reminder_setting || []).forEach(setting => {
    if (setting.is_enabled !== 1) return

    const taskTypeId = setting.task_type_id || task.task_type_id || ''
    const key = `${setting.reminder_channel_id}|${setting.role_type}|${taskTypeId}`

    if (!groupedReminders.has(key)) {
      groupedReminders.set(key, {
        reminder_channel_id: setting.reminder_channel_id,
        role_type: setting.role_type,
        task_type_id: taskTypeId,
        reminder_time_ids: []
      })
    }

    groupedReminders.get(key)?.reminder_time_ids.push({
      id: setting.reminder_time_id,
      is_enabled: setting.is_enabled
    })
  })

  return Array.from(groupedReminders.values()).filter(item => item.reminder_time_ids.length > 0)
}

export default function TaskViewModal({
  open,
  onOpenChange,
  taskId,
  canEditTask = false,
  onEditTask,
  clients = [],
  taskTypes = [],
  onTaskStatusChanged
}: TaskViewModalProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [commentHtml, setCommentHtml] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isSavingDescription, setIsSavingDescription] = useState(false)
  const [editingField, setEditingField] = useState<InlineEditableField | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [isSavingInlineField, setIsSavingInlineField] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('')

  useEffect(() => {
    getAuthUser().then(user => {
      setCurrentUserId(user?.id || '')
    })
  }, [])

  const loadTaskDetails = async () => {
    if (!taskId) return

    setIsLoadingTask(true)

    try {
      const response = await TaskService.show(taskId)
      const taskData = response?.data as Task

      setTask(taskData)
      setDescriptionHtml(taskData?.description || '')
      setIsEditingDescription(false)
      setEditingField(null)
      setEditingValue('')
      setComments(sortCommentsByUpdatedAt(taskData?.comments || []))
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to load task details')
    } finally {
      setIsLoadingTask(false)
    }
  }

  useEffect(() => {
    if (!open || !taskId) return

    void loadTaskDetails()
    setCommentHtml('')
    setIsEditingDescription(false)
    setEditingField(null)
    setEditingValue('')
  }, [open, taskId])

  const buildTaskPayload = (sourceTask: Task, overrides: Partial<TaskPayload> = {}): TaskPayload => ({
    name: sourceTask.name || '',
    client_id: sourceTask.client_id || '',
    task_type_id: sourceTask.task_type_id || '',
    employee_ids: sourceTask.employees?.map(employee => employee.id) || [],
    start_date: sourceTask.start_date || '',
    start_time: sourceTask.start_time || '',
    end_date: sourceTask.end_date || '',
    end_time: sourceTask.end_time || '',
    sms_reminder: sourceTask.sms_reminder || 0,
    email_reminder: sourceTask.email_reminder || 0,
    location: sourceTask.location || '',
    description: sourceTask.description || '',
    completed_date: sourceTask.completed_date || '',
    close_comment: sourceTask.close_comment || '',
    status: sourceTask.status || '',
    reminders: buildTaskReminderPayload(sourceTask),
    ...overrides
  })

  const startEditingDescription = () => {
    if (!task) return

    setDescriptionHtml(task.description || '')
    setIsEditingDescription(true)
  }

  const cancelDescriptionEdit = () => {
    setDescriptionHtml(task?.description || '')
    setIsEditingDescription(false)
  }

  const saveDescription = async () => {
    if (!task || !taskId) return

    const payload = buildTaskPayload(task, { description: descriptionHtml || '' })

    setIsSavingDescription(true)

    try {
      const response = await TaskService.update(taskId, payload)
      const updatedTask = response?.data as Task | undefined

      if (updatedTask?.id) {
        // setTask(updatedTask)
        setTask(prev => (prev ? { ...prev, description: updatedTask.description } : prev))
        setDescriptionHtml(updatedTask.description || '')

        // if (updatedTask.comments) {
        //   setComments(sortCommentsByUpdatedAt(updatedTask.comments))
        // }
      } else {
        setTask(prev => (prev ? { ...prev, description: descriptionHtml } : prev))
      }

      setIsEditingDescription(false)
      toast.success('Description updated successfully')
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update description')
    } finally {
      setIsSavingDescription(false)
    }
  }

  const startInlineEdit = (field: InlineEditableField, value?: string) => {
    if (!task || !canEditTask || isSavingInlineField) return

    setEditingField(field)
    setEditingValue(value ?? '')
  }

  const cancelInlineEdit = () => {
    setEditingField(null)
    setEditingValue('')
  }

  const saveInlineField = async (field: InlineEditableField, explicitValue?: string) => {
    if (!task || !taskId || isSavingInlineField) return

    const rawValue = explicitValue ?? editingValue
    const nextValue = field === 'close_comment' ? rawValue : rawValue.trim()
    const currentValue = `${(task as any)[field] || ''}`

    if (nextValue === currentValue) {
      cancelInlineEdit()

      return
    }

    setIsSavingInlineField(true)

    try {
      if (field === 'status') {
        const response = await TaskService.updateStatus(taskId, nextValue, 0)
        const statusUpdate = response?.data as Partial<Task> | undefined

        setTask(prev => {
          if (!prev) return prev

          return {
            ...prev,
            ...statusUpdate,
            status: nextValue,
            order: 0,
            updated_at: statusUpdate?.updated_at || new Date().toISOString()
          }
        })

        const mergedTask: Task = {
          ...task,
          ...statusUpdate,
          status: nextValue,
          order: 0
        }

        onTaskStatusChanged?.(taskId, nextValue, 0, mergedTask)
        toast.success('Status updated successfully')
      } else {
        const payloadOverrides: Partial<TaskPayload> =
          field === 'client_id'
            ? { client_id: nextValue }
            : field === 'task_type_id'
              ? { task_type_id: nextValue }
              : ({ [field]: nextValue } as Partial<TaskPayload>)

        const payload = buildTaskPayload(task, payloadOverrides)
        const response = await TaskService.update(taskId, payload)
        const updatedTask = response?.data as Task | undefined
        const selectedClient = field === 'client_id' ? clients.find(client => client.id === nextValue) : undefined

        const selectedTaskType =
          field === 'task_type_id' ? taskTypes.find(taskType => taskType.id === nextValue) : undefined

        if (updatedTask?.id) {
          setTask(prev => {
            if (!prev) return prev

            return {
              ...prev,
              ...updatedTask,
              ...(field === 'client_id' ? { client_id: nextValue, client: selectedClient || prev.client } : {}),
              ...(field === 'task_type_id'
                ? { task_type_id: nextValue, task_type: selectedTaskType || prev.task_type }
                : {})
            }
          })
        } else {
          setTask(prev => {
            if (!prev) return prev

            return {
              ...prev,
              [field]: nextValue,
              ...(field === 'client_id' ? { client_id: nextValue, client: selectedClient || prev.client } : {}),
              ...(field === 'task_type_id'
                ? { task_type_id: nextValue, task_type: selectedTaskType || prev.task_type }
                : {})
            }
          })
        }

        toast.success('Task updated successfully')
      }

      cancelInlineEdit()
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update task')
    } finally {
      setIsSavingInlineField(false)
    }
  }

  const sortedComments = useMemo(() => {
    return sortCommentsByUpdatedAt(comments)
  }, [comments])

  const addComment = async () => {
    if (!taskId) return

    const plainComment = getPlainTextFromHtml(commentHtml)

    if (!plainComment) {
      toast.error('Comment cannot be empty')

      return
    }

    const userId = currentUserId || (await getAuthUser())?.id || ''

    if (!userId) {
      toast.error('Unable to identify current user for comment')

      return
    }

    setIsAddingComment(true)

    try {
      const response = await TaskCommentService.store(taskId, {
        task_id: taskId,
        user_id: userId,
        comment: commentHtml
      })

      const createdComment = response?.data as TaskComment | undefined

      if (createdComment?.id) {
        setComments(prev => sortCommentsByUpdatedAt([...prev, createdComment]))
        setTask(prev =>
          prev ? { ...prev, comments: sortCommentsByUpdatedAt([...(prev.comments || []), createdComment]) } : prev
        )
      }

      setCommentHtml('')
      toast.success('Comment added successfully')
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to add comment')
    } finally {
      setIsAddingComment(false)
    }
  }

  const subtitle = useMemo(() => {
    if (!task) return 'Task details'

    const customerName = [task.client?.first_name, task.client?.last_name].filter(Boolean).join(' ')

    return customerName ? `${task.name} - ${customerName}` : task.name
  }, [task])

  const statusMeta = getStatusMeta(task?.status)
  const addressOptions = task?.client?.addresses || []

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Task Details'
      description={subtitle}
      maxWidth='6xl'
      isLoading={isLoadingTask}
      actions={
        <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-5'>
          <div className='space-y-2'>
            {editingField === 'name' ? (
              <Input
                value={editingValue}
                autoFocus
                disabled={isSavingInlineField}
                onChange={event => setEditingValue(event.target.value)}
                onBlur={() => {
                  void saveInlineField('name')
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void saveInlineField('name')
                  }

                  if (event.key === 'Escape') {
                    event.preventDefault()
                    cancelInlineEdit()
                  }
                }}
              />
            ) : (
              <p
                className={cn('text-xl', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('name', task?.name || '')}
              >
                {task?.name || '-'}
              </p>
            )}
            <Separator />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <Label>Description</Label>
              {/* {task && !isEditingDescription ? (
                <Button type='button' variant='outline' size='sm' onClick={startEditingDescription}>
                  Edit
                </Button>
              ) : null} */}
            </div>

            {isEditingDescription ? (
              <div className='rounded-md border border-border p-2 space-y-2'>
                <TipTapRichTextEditor
                  value={descriptionHtml}
                  onChange={setDescriptionHtml}
                  placeholder='Enter task description'
                  disabled={isSavingDescription}
                />
                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={cancelDescriptionEdit}
                    disabled={isSavingDescription}
                  >
                    Cancel
                  </Button>
                  <Button type='button' onClick={saveDescription} disabled={isSavingDescription}>
                    {isSavingDescription ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  'p-4 rounded-md border border-transparent',
                  task && 'cursor-pointer transition-colors border-border'
                )}
                onClick={startEditingDescription}
                role={task ? 'button' : undefined}
                tabIndex={task ? 0 : -1}
                onKeyDown={event => {
                  if (!task) return

                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    startEditingDescription()
                  }
                }}
              >
                {task?.description ? (
                  <div
                    className='text-sm wrap-break-word [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md [&_video]:my-2 [&_video]:max-w-full [&_video]:rounded-md'
                    dangerouslySetInnerHTML={{ __html: task.description }}
                  />
                ) : (
                  <p className='text-sm text-muted-foreground'>No description available.</p>
                )}
              </div>
            )}
          </div>

          <div className='space-y-3'>
            <Label>Add Comment</Label>
            <div className='space-y-2'>
              <TipTapRichTextEditor
                value={commentHtml}
                onChange={setCommentHtml}
                placeholder='Write a comment...'
                disabled={isAddingComment || !task}
              />
              <div className='flex justify-end'>
                <Button type='button' onClick={addComment} disabled={isAddingComment || !task}>
                  {isAddingComment ? 'Adding...' : 'Add Comment'}
                </Button>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <Label>Comments</Label>
            <div className=' rounded-md border border-border p-3 space-y-4'>
              {sortedComments.length === 0 && <p className='text-sm text-muted-foreground'>No comments yet.</p>}

              {sortedComments.map(comment => {
                const displayName = getDisplayName(comment)
                const avatarUrl = getAvatarUrl(comment)
                const updatedAt = comment.updated_at || comment.created_at

                return (
                  <div key={comment.id} className='flex gap-3'>
                    <Avatar className='h-9 w-9'>
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy='no-referrer' />
                      ) : null}
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 px-3'>
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <p className='text-sm font-bold'>{displayName}</p>
                        <p className='text-xs text-muted-foreground'>{formatDateTime(updatedAt)}</p>
                      </div>
                      <div className='mt-1 rounded-md py-2'>
                        <div
                          className='text-sm wrap-break-word [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0'
                          dangerouslySetInnerHTML={{ __html: comment.comment || '' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

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
                <div className='flex-1'>
                  <Select
                    value={editingValue || task?.status || ''}
                    onValueChange={value => {
                      setEditingValue(value)
                      void saveInlineField('status', value)
                    }}
                    disabled={isSavingInlineField}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='backlog'>Backlog</SelectItem>
                      <SelectItem value='to-do'>To Do</SelectItem>
                      <SelectItem value='overdue'>Overdue</SelectItem>
                      <SelectItem value='in-progress'>In Progress</SelectItem>
                      <SelectItem value='completed'>Completed</SelectItem>
                      <SelectItem value='cancelled'>Cancelled</SelectItem>
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
                <div className='flex-1'>
                  <Select
                    value={editingValue || task?.task_type_id || ''}
                    onValueChange={value => {
                      setEditingValue(value)
                      void saveInlineField('task_type_id', value)
                    }}
                    disabled={isSavingInlineField}
                  >
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
                <div className='flex-1'>
                  <Select
                    value={editingValue || task?.client_id || ''}
                    onValueChange={value => {
                      setEditingValue(value)
                      void saveInlineField('client_id', value)
                    }}
                    disabled={isSavingInlineField}
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

            <div className='flex items-center gap-3 flex-row '>
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Company : </Label>
              <p
                className={cn('text-sm flex-1', canEditTask && 'cursor-pointer')}
                onClick={() => startInlineEdit('client_id', task?.client_id || '')}
              >
                {task?.client?.company?.name || '-'}
              </p>
            </div>

            <div className='flex items-start gap-3 flex-row '>
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Location : </Label>
              {editingField === 'location' ? (
                <div className='flex-1'>
                  <Select
                    value={editingValue || task?.location || ''}
                    onValueChange={value => {
                      setEditingValue(value)
                      void saveInlineField('location', value)
                    }}
                    disabled={isSavingInlineField || addressOptions.length === 0}
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
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Start : </Label>
              <div className='flex-1 flex gap-2'>
                {editingField === 'start_date' ? (
                  <DatePicker
                    value={editingValue ? parseDateString(editingValue) : null}
                    onChange={val => {
                      const nextDate = val ? format(val, 'yyyy-MM-dd') : ''

                      setEditingValue(nextDate)
                      void saveInlineField('start_date', nextDate)
                    }}
                    placeholder='Select start date'
                  />
                ) : (
                  <p
                    className={cn('text-sm', canEditTask && 'cursor-pointer')}
                    onClick={() => startInlineEdit('start_date', task?.start_date || '')}
                  >
                    {task?.start_date || '-'}
                  </p>
                )}
                {editingField === 'start_time' ? (
                  <Input
                    type='time'
                    step='1'
                    value={editingValue}
                    autoFocus
                    disabled={isSavingInlineField}
                    onChange={event => setEditingValue(event.target.value)}
                    onBlur={() => {
                      void saveInlineField('start_time')
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void saveInlineField('start_time')
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
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>End : </Label>
              <div className='flex-1 flex gap-2'>
                {editingField === 'end_date' ? (
                  <DatePicker
                    value={editingValue ? parseDateString(editingValue) : null}
                    onChange={val => {
                      const nextDate = val ? format(val, 'yyyy-MM-dd') : ''

                      setEditingValue(nextDate)
                      void saveInlineField('end_date', nextDate)
                    }}
                    placeholder='Select end date'
                  />
                ) : (
                  <p
                    className={cn('text-sm', canEditTask && 'cursor-pointer')}
                    onClick={() => startInlineEdit('end_date', task?.end_date || '')}
                  >
                    {task?.end_date || '-'}
                  </p>
                )}
                {editingField === 'end_time' ? (
                  <Input
                    type='time'
                    step='1'
                    value={editingValue}
                    autoFocus
                    disabled={isSavingInlineField}
                    onChange={event => setEditingValue(event.target.value)}
                    onBlur={() => {
                      void saveInlineField('end_time')
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void saveInlineField('end_time')
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
              <div className='flex  flex-1flex-wrap gap-1'>
                {task?.employees?.length ? (
                  task.employees.map(employee => (
                    <Badge key={employee.id} variant='outline'>
                      {employee.first_name} {employee.last_name}
                    </Badge>
                  ))
                ) : (
                  <p className='text-sm'>-</p>
                )}
              </div>
            </div>

            <div className='flex items-center gap-3 flex-row '>
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Created By : </Label>
              <p className='text-sm flex-1'>
                {[task?.created_by?.first_name, task?.created_by?.last_name].filter(Boolean).join(' ') || '-'}
              </p>
            </div>

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
              {editingField === 'completed_date' ? (
                <div className='flex-1'>
                  <DatePicker
                    value={editingValue ? parseDateString(editingValue) : null}
                    onChange={val => {
                      const nextDate = val ? format(val, 'yyyy-MM-dd') : ''

                      setEditingValue(nextDate)
                      void saveInlineField('completed_date', nextDate)
                    }}
                    placeholder='Select completed date'
                  />
                </div>
              ) : (
                <p
                  className={cn('text-sm flex-1', canEditTask && 'cursor-pointer')}
                  onClick={() => startInlineEdit('completed_date', task?.completed_date || '')}
                >
                  {task?.completed_date || '-'}
                </p>
              )}
            </div>

            <div className='flex items-center gap-3 flex-row '>
              <Label className='text-xs text-muted-foreground min-w-25 lg:min-w-20'>Close Comment : </Label>
              {editingField === 'close_comment' ? (
                <Textarea
                  value={editingValue}
                  autoFocus
                  disabled={isSavingInlineField}
                  onChange={event => setEditingValue(event.target.value)}
                  onBlur={() => {
                    void saveInlineField('close_comment')
                  }}
                  onKeyDown={event => {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                      event.preventDefault()
                      void saveInlineField('close_comment')
                    }

                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelInlineEdit()
                    }
                  }}
                  className='flex-1 min-h-20'
                />
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

          <TaskDocuments taskId={taskId} />
        </div>
      </div>
    </CommonDialog>
  )
}
