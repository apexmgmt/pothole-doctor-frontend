'use client'

import { useEffect, useMemo, useState } from 'react'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import TipTapRichTextEditor from '@/components/erp/common/editor/TipTapRichTextEditor'
import TaskService from '@/services/api/tasks/tasks.service'
import TaskCommentService from '@/services/api/tasks/task-comments.service'
import { ReminderPayload, Task, TaskComment, TaskPayload } from '@/types'
import { getAuthUser } from '@/utils/auth'
import { generateFileUrl } from '@/utils/utility'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TaskViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId?: string
  canEditTask?: boolean
  onEditTask?: (id: string) => void
}

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
  onEditTask
}: TaskViewModalProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [commentHtml, setCommentHtml] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isSavingDescription, setIsSavingDescription] = useState(false)
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
  }, [open, taskId])

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

    const payload: TaskPayload = {
      name: task.name || '',
      client_id: task.client_id || '',
      task_type_id: task.task_type_id || '',
      employee_ids: task.employees?.map(employee => employee.id) || [],
      start_date: task.start_date || '',
      start_time: task.start_time || '',
      end_date: task.end_date || '',
      end_time: task.end_time || '',
      sms_reminder: task.sms_reminder || 0,
      email_reminder: task.email_reminder || 0,
      location: task.location || '',
      description: descriptionHtml || '',
      completed_date: task.completed_date || '',
      close_comment: task.close_comment || '',
      status: task.status || '',
      reminders: buildTaskReminderPayload(task)
    }

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
            <p className='text-xl'>{task?.name || '-'}</p>
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
                  task && 'cursor-pointer transition-colors hover:border-border'
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

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Status</Label>
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Task Type</Label>
              <p className='text-sm'>{task?.task_type?.name || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Customer</Label>
              <p className='text-sm'>
                {[task?.client?.first_name, task?.client?.last_name].filter(Boolean).join(' ') || '-'}
              </p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Company</Label>
              <p className='text-sm'>{task?.client?.company?.name || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Location</Label>
              <p className='text-sm'>{task?.location || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Start</Label>
              <p className='text-sm'>{[task?.start_date, task?.start_time].filter(Boolean).join(' ') || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>End</Label>
              <p className='text-sm'>{[task?.end_date, task?.end_time].filter(Boolean).join(' ') || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Assigned To</Label>
              <div className='flex flex-wrap gap-1'>
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

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Created By</Label>
              <p className='text-sm'>
                {[task?.created_by?.first_name, task?.created_by?.last_name].filter(Boolean).join(' ') || '-'}
              </p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Created At</Label>
              <p className='text-sm'>{formatDateTime(task?.created_at)}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Updated At</Label>
              <p className='text-sm'>{formatDateTime(task?.updated_at)}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Completed Date</Label>
              <p className='text-sm'>{task?.completed_date || '-'}</p>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Close Comment</Label>
              <p className='text-sm whitespace-pre-wrap'>{task?.close_comment || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </CommonDialog>
  )
}
