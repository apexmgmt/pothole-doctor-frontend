'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import TaskService from '@/services/api/tasks/tasks.service'
import { Client, Staff, Task, TaskComment, TaskPayload, TaskType } from '@/types'
import { getAuthUser } from '@/utils/auth'
import TaskDocuments from '../documents/TaskDocuments'
import DescriptionAndCommentsSection from './components/DescriptionAndCommentsSection'
import TaskDetailsPanel from './components/TaskDetailsPanel'
import { buildTaskPayload, sortCommentsByUpdatedAt } from './helpers'
import { InlineEditableField, TaskViewModalProps } from './types'

export default function TaskViewModal({
  open,
  onOpenChange,
  taskId,
  canEditTask = false,
  onEditTask,
  clients = [],
  staffs = [],
  taskTypes = [],
  onTaskStatusChanged
}: TaskViewModalProps) {
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<TaskComment[]>([])
  const [commentHtml, setCommentHtml] = useState('')
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isSavingDescription, setIsSavingDescription] = useState(false)
  const [editingField, setEditingField] = useState<InlineEditableField | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingEmployeeIds, setEditingEmployeeIds] = useState<string[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve())
  const taskRef = useRef<Task | null>(null)
  const lastInlineSaveRequestIdRef = useRef(0)

  useEffect(() => {
    taskRef.current = task
  }, [task])

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
    if (!task || !canEditTask) return

    if (field === 'employee_ids') {
      setEditingField(field)
      setEditingEmployeeIds(task.employees?.map(employee => employee.id) || [])
      setEditingValue('')

      return
    }

    setEditingField(field)
    setEditingValue(value ?? '')
  }

  const cancelInlineEdit = () => {
    setEditingField(null)
    setEditingValue('')
    setEditingEmployeeIds([])
  }

  const enqueueSave = (executor: () => Promise<void>) => {
    saveQueueRef.current = saveQueueRef.current.then(executor).catch(() => {
      // Keep queue alive for later updates.
    })
  }

  const getAddressDisplayValue = (client?: Client) => {
    const addresses = client?.addresses || []

    if (addresses.length === 0) return ''

    const preferredAddress = addresses.find(address => address.is_default === 1) || addresses[0]

    return [
      preferredAddress?.street_address,
      preferredAddress?.city?.name,
      preferredAddress?.state?.name,
      preferredAddress?.zip_code
    ]
      .filter(Boolean)
      .join(', ')
  }

  const saveInlineField = async (field: InlineEditableField, explicitValue?: string | string[]) => {
    const baseTask = taskRef.current || task

    if (!baseTask || !taskId) return

    const rawValue = explicitValue ?? (field === 'employee_ids' ? editingEmployeeIds : editingValue)

    const nextValue =
      field === 'employee_ids'
        ? Array.isArray(rawValue)
          ? rawValue
          : []
        : field === 'close_comment'
          ? String(rawValue || '')
          : String(rawValue || '').trim()

    const currentValue =
      field === 'employee_ids'
        ? baseTask.employees?.map(employee => employee.id) || []
        : `${(baseTask as any)[field] || ''}`

    const hasNoChange =
      field === 'employee_ids'
        ? Array.isArray(nextValue) &&
          Array.isArray(currentValue) &&
          nextValue.length === currentValue.length &&
          nextValue.every(id => currentValue.includes(id))
        : nextValue === currentValue

    if (hasNoChange) {
      cancelInlineEdit()

      return
    }

    const selectedClient =
      field === 'client_id' && typeof nextValue === 'string'
        ? clients.find(client => client.id === nextValue)
        : undefined

    const clientLocation = field === 'client_id' ? getAddressDisplayValue(selectedClient) : undefined

    const selectedTaskType =
      field === 'task_type_id' && typeof nextValue === 'string'
        ? taskTypes.find(taskType => taskType.id === nextValue)
        : undefined

    const selectedEmployees =
      field === 'employee_ids' && Array.isArray(nextValue)
        ? staffs.filter(staff => nextValue.includes(staff.id))
        : undefined

    const selectedCreator =
      field === 'created_by_id' && typeof nextValue === 'string'
        ? staffs.find(staff => staff.id === nextValue)
        : undefined

    const queuedRequestId = ++lastInlineSaveRequestIdRef.current

    // Close immediately so users can continue editing another field while save runs in background.
    cancelInlineEdit()

    setTask(prev => {
      const sourceTask = prev || taskRef.current

      if (!sourceTask) return prev

      const nextTask = {
        ...sourceTask,
        [field]: nextValue,
        ...(field === 'client_id' && typeof nextValue === 'string'
          ? { client_id: nextValue, client: selectedClient || sourceTask.client, location: clientLocation ?? '' }
          : {}),
        ...(field === 'task_type_id' && typeof nextValue === 'string'
          ? { task_type_id: nextValue, task_type: selectedTaskType || sourceTask.task_type }
          : {}),
        ...(field === 'employee_ids' && Array.isArray(nextValue)
          ? { employees: selectedEmployees?.length ? selectedEmployees : sourceTask.employees }
          : {}),
        ...(field === 'created_by_id' && typeof nextValue === 'string' && selectedCreator && sourceTask.created_by
          ? { created_by: { ...sourceTask.created_by, ...selectedCreator, id: selectedCreator.id } }
          : {}),
        ...(field === 'status' && typeof nextValue === 'string' ? { status: nextValue, order: 0 } : {})
      }

      taskRef.current = nextTask

      return nextTask
    })

    enqueueSave(async () => {
      const latestTask = taskRef.current

      if (!latestTask) return

      if (field === 'status') {
        if (typeof nextValue !== 'string') return

        try {
          const response = await TaskService.updateStatus(taskId, nextValue, 0)
          const statusUpdate = response?.data as Partial<Task> | undefined

          const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

          if (statusUpdate && isLatestInlineRequest) {
            setTask(prev => (prev ? { ...prev, ...statusUpdate } : prev))
            taskRef.current = taskRef.current ? { ...taskRef.current, ...statusUpdate } : taskRef.current
          }

          const mergedTask: Task = {
            ...latestTask,
            ...statusUpdate,
            status: nextValue,
            order: 0
          }

          onTaskStatusChanged?.(taskId, nextValue, 0, mergedTask)
        } catch (error: any) {
          const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

          if (isLatestInlineRequest) {
            toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update task')
            await loadTaskDetails()
          }
        }

        return
      }

      const payloadOverrides: Partial<TaskPayload> =
        field === 'client_id'
          ? { client_id: String(nextValue || ''), location: clientLocation ?? '' }
          : field === 'task_type_id'
            ? { task_type_id: String(nextValue || '') }
            : field === 'employee_ids'
              ? { employee_ids: Array.isArray(nextValue) ? nextValue : [] }
              : ({ [field]: nextValue } as Partial<TaskPayload>)

      try {
        const payload = buildTaskPayload(latestTask, payloadOverrides)
        const response = await TaskService.update(taskId, payload)
        const updatedTask = response?.data as Task | undefined
        const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

        if (updatedTask?.id && isLatestInlineRequest) {
          setTask(prev => (prev ? { ...prev, ...updatedTask } : prev))
          taskRef.current = taskRef.current ? { ...taskRef.current, ...updatedTask } : taskRef.current
        }
      } catch (error: any) {
        const isLatestInlineRequest = queuedRequestId === lastInlineSaveRequestIdRef.current

        if (isLatestInlineRequest) {
          toast.error(typeof error?.message === 'string' ? error.message : 'Failed to update task')
          await loadTaskDetails()
        }
      }
    })
  }

  useEffect(() => {
    if (!editingField) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null

      if (!target) return

      const isInsideInlineEditor = target.closest('[data-inline-editor]')
      const isInsideFloatingLayer = target.closest('[data-radix-popper-content-wrapper], [data-radix-portal]')

      if (isInsideInlineEditor || isInsideFloatingLayer) return

      const shouldSaveOnOutsideClick: InlineEditableField[] = ['name', 'start_time', 'end_time', 'close_comment']

      if (shouldSaveOnOutsideClick.includes(editingField)) {
        void saveInlineField(editingField)

        return
      }

      cancelInlineEdit()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [editingField, cancelInlineEdit, saveInlineField])

  const subtitle = useMemo(() => {
    if (!task) return 'Task details'

    const customerName = [task.client?.first_name, task.client?.last_name].filter(Boolean).join(' ')

    return customerName ? `${task.name} - ${customerName}` : task.name
  }, [task])

  const sortedComments = useMemo(() => sortCommentsByUpdatedAt(comments), [comments])

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
        <DescriptionAndCommentsSection
          task={task}
          taskId={taskId}
          canEditTask={canEditTask}
          commentHtml={commentHtml}
          setCommentHtml={setCommentHtml}
          comments={sortedComments}
          setComments={setComments}
          setTask={setTask}
          descriptionHtml={descriptionHtml}
          setDescriptionHtml={setDescriptionHtml}
          isEditingDescription={isEditingDescription}
          setIsEditingDescription={setIsEditingDescription}
          saveDescription={saveDescription}
          isSavingDescription={isSavingDescription}
          isAddingComment={isAddingComment}
          setIsAddingComment={setIsAddingComment}
          currentUserId={currentUserId}
          editingField={editingField}
          editingValue={editingValue}
          setEditingValue={setEditingValue}
          startInlineEdit={startInlineEdit}
          saveInlineField={saveInlineField}
          cancelInlineEdit={cancelInlineEdit}
        />

        <div>
          <TaskDetailsPanel
            task={task}
            taskId={taskId}
            canEditTask={canEditTask}
            isLoadingTask={isLoadingTask}
            onEditTask={onEditTask}
            clients={clients}
            staffs={staffs}
            taskTypes={taskTypes}
            editingField={editingField}
            editingValue={editingValue}
            setEditingValue={setEditingValue}
            editingEmployeeIds={editingEmployeeIds}
            setEditingEmployeeIds={setEditingEmployeeIds}
            startInlineEdit={startInlineEdit}
            saveInlineField={saveInlineField}
            cancelInlineEdit={cancelInlineEdit}
          />

          <TaskDocuments taskId={taskId} />
        </div>
      </div>
    </CommonDialog>
  )
}
