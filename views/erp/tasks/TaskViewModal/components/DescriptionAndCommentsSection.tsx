'use client'

import { Dispatch, SetStateAction } from 'react'

import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import TipTapRichTextEditor from '@/components/erp/common/editor/TipTapRichTextEditor'
import TaskCommentService from '@/services/api/tasks/task-comments.service'
import { Task, TaskComment } from '@/types'
import { getAuthUser } from '@/utils/auth'
import { generateFileUrl } from '@/utils/utility'
import { cn } from '@/lib/utils'
import {
  formatDateTime,
  getAvatarUrl,
  getDisplayName,
  getInitials,
  getPlainTextFromHtml,
  sortCommentsByUpdatedAt
} from '../helpers'
import { InlineEditableField } from '../types'

interface DescriptionAndCommentsSectionProps {
  task: Task | null
  taskId?: string
  canEditTask: boolean
  commentHtml: string
  setCommentHtml: Dispatch<SetStateAction<string>>
  comments: TaskComment[]
  setComments: Dispatch<SetStateAction<TaskComment[]>>
  setTask: Dispatch<SetStateAction<Task | null>>
  descriptionHtml: string
  setDescriptionHtml: Dispatch<SetStateAction<string>>
  isEditingDescription: boolean
  setIsEditingDescription: Dispatch<SetStateAction<boolean>>
  saveDescription: () => Promise<void>
  isSavingDescription: boolean
  isAddingComment: boolean
  setIsAddingComment: Dispatch<SetStateAction<boolean>>
  currentUserId: string
  editingField: InlineEditableField | null
  editingValue: string
  setEditingValue: Dispatch<SetStateAction<string>>
  startInlineEdit: (field: InlineEditableField, value?: string) => void
  saveInlineField: (field: InlineEditableField, explicitValue?: string) => void
  cancelInlineEdit: () => void
}

export default function DescriptionAndCommentsSection({
  task,
  taskId,
  canEditTask,
  commentHtml,
  setCommentHtml,
  comments,
  setComments,
  setTask,
  descriptionHtml,
  setDescriptionHtml,
  isEditingDescription,
  setIsEditingDescription,
  saveDescription,
  isSavingDescription,
  isAddingComment,
  setIsAddingComment,
  currentUserId,
  editingField,
  editingValue,
  setEditingValue,
  startInlineEdit,
  saveInlineField,
  cancelInlineEdit
}: DescriptionAndCommentsSectionProps) {
  const sortedComments = sortCommentsByUpdatedAt(comments)

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

  return (
    <div className='lg:col-span-2 space-y-5'>
      <div className='space-y-2'>
        {editingField === 'name' ? (
          <Input
            data-inline-editor
            value={editingValue}
            autoFocus
            onChange={event => setEditingValue(event.target.value)}
            onBlur={() => {
              saveInlineField('name')
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                saveInlineField('name')
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
                onClick={() => {
                  setDescriptionHtml(task?.description || '')
                  setIsEditingDescription(false)
                }}
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
            onClick={() => {
              setDescriptionHtml(task?.description || '')
              setIsEditingDescription(true)
            }}
            role={task ? 'button' : undefined}
            tabIndex={task ? 0 : -1}
            onKeyDown={event => {
              if (!task) return

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setDescriptionHtml(task?.description || '')
                setIsEditingDescription(true)
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
        <div className='rounded-md border border-border p-3 space-y-4'>
          {sortedComments.length === 0 && <p className='text-sm text-muted-foreground'>No comments yet.</p>}

          {sortedComments.map(comment => {
            const displayName = getDisplayName(comment)
            const avatarUrl = getAvatarUrl(comment, generateFileUrl)
            const updatedAt = comment.updated_at || comment.created_at

            return (
              <div key={comment.id} className='flex gap-3'>
                <Avatar className='h-9 w-9'>
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy='no-referrer' /> : null}
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
  )
}
