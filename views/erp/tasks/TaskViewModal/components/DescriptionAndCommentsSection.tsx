'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'

import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TipTapRichTextEditor, { TipTapRichTextEditorRef } from '@/components/erp/common/editor/TipTapRichTextEditor'
import TaskCommentService from '@/services/api/tasks/task-comments.service'
import { Task, TaskComment } from '@/types'
import { getAuthUser } from '@/utils/auth'
import { generateFileUrl } from '@/utils/utility'
import {
  formatDateTime,
  getAvatarUrl,
  getDisplayName,
  getInitials,
  getPlainTextFromHtml,
  sortCommentsByUpdatedAt
} from '../helpers'
import { InlineEditableField } from '../types'
import { useAppSelector } from '@/lib/hooks'
import { formatTimeAgo } from '@/utils/date'

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
  const commentEditorRef = useRef<TipTapRichTextEditorRef>(null)
  const [isCommentEditorOpen, setIsCommentEditorOpen] = useState(false)
  const sortedComments = useMemo(() => sortCommentsByUpdatedAt(comments), [comments])

  const orderedComments = useMemo(
    () =>
      [...sortedComments].sort(
        (a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
      ),
    [sortedComments]
  )

  const renderedComments = useMemo(
    () =>
      orderedComments.map(comment => {
        const displayName = getDisplayName(comment)
        const avatarUrl = getAvatarUrl(comment, generateFileUrl)
        const updatedAt = comment.updated_at || comment.created_at

        return (
          <div key={comment.id} className='flex gap-3'>
            <Avatar className='size-9'>
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} referrerPolicy='no-referrer' /> : null}
              <AvatarFallback className='bg-primary text-sm'>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className='flex-1 px-3'>
              <div>
                <p className='text-sm font-bold'>{displayName}</p>
                <p className='mt-1.5 text-xs text-muted-foreground'>{formatTimeAgo(updatedAt)}</p>
              </div>
              <div className='mt-3 rounded-md'>
                <div
                  className='text-sm wrap-break-word [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:pl-3 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0'
                  dangerouslySetInnerHTML={{ __html: comment.comment || '' }}
                />
              </div>
            </div>
          </div>
        )
      }),
    [orderedComments]
  )

  const user = useAppSelector(state => state.auth.user)
  const firstName = user?.first_name ?? ''
  const lastName = user?.last_name ?? ''
  const avatarUrl = user?.userable?.profile_picture ? generateFileUrl(user.userable.profile_picture) : undefined

  const initials = `${firstName} ${lastName}`
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    if (commentHtml === '') {
      commentEditorRef.current?.collapse()
    }
  }, [commentHtml])

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

      setCommentHtml('')
      commentEditorRef.current?.clear()
      toast.success('Comment added successfully')

      if (createdComment?.id) {
        setComments(prev => sortCommentsByUpdatedAt([...prev, createdComment]))
        setTask(prev =>
          prev ? { ...prev, comments: sortCommentsByUpdatedAt([...(prev.comments || []), createdComment]) } : prev
        )
      }
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to add comment')
    } finally {
      setIsAddingComment(false)
    }
  }

  return (
    <div className='py-px space-y-5'>
      {/* Heading */}
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
            className={`text-lg leading-tight hover:bg-accent/40 px-2.5 py-1.5 rounded-md transition-colors duration-100 ${canEditTask ? 'cursor-pointer' : ''}`}
            onClick={() => startInlineEdit('name', task?.name || '')}
          >
            {task?.name || '-'}
          </p>
        )}
      </div>

      {/* Description */}
      <div className='space-y-2'>
        <Label className='px-2.5 text-sm text-muted-foreground'>Description</Label>

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
                className='text-xs h-7'
              >
                Cancel
              </Button>
              <Button type='button' onClick={saveDescription} disabled={isSavingDescription} className='text-xs h-7'>
                {isSavingDescription ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className='hover:bg-accent/40 px-2.5 py-1.5 rounded-md transition-colors duration-100 cursor-pointer'
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
            {task?.description && task.description !== '<p></p>' ? (
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

      {/* Comments */}
      <div className='px-2.5'>
        <Label className='text-sm text-muted-foreground mb-3'>Comments</Label>
        <div className='flex items-start gap-4 sticky top-0 bg-card z-10'>
          <Avatar className='size-7.5'>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={firstName + ' ' + lastName} referrerPolicy='no-referrer' />
            ) : null}
            <AvatarFallback className='bg-primary text-xs'>{initials}</AvatarFallback>
          </Avatar>

          <div className='flex-1 space-y-2 px-px pb-3'>
            <TipTapRichTextEditor
              ref={commentEditorRef}
              value={commentHtml}
              onChange={setCommentHtml}
              placeholder='Write a comment...'
              disabled={isAddingComment || !task}
              onExpandedChange={setIsCommentEditorOpen}
              inputClassName='min-h-16'
            />
            {isCommentEditorOpen && (
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setCommentHtml('')
                    commentEditorRef.current?.collapse()
                  }}
                  disabled={isAddingComment || !task}
                  className='text-xs h-7'
                >
                  Cancel
                </Button>
                <Button type='button' onClick={addComment} disabled={isAddingComment || !task} className='text-xs h-7'>
                  {isAddingComment ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Comments List */}
        <div className='space-y-6 mt-6'>
          {orderedComments.length === 0 && <p className='text-sm text-muted-foreground'>No comments yet.</p>}
          {renderedComments}
        </div>
      </div>
    </div>
  )
}
