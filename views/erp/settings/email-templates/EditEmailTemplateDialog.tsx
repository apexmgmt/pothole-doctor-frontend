'use client'

import { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

import { EmailTemplate, EmailTemplatePayload } from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import TipTapRichTextEditor, { TipTapRichTextEditorRef } from '@/components/erp/common/editor/TipTapRichTextEditor'
import EmailTemplateService from '@/services/api/settings/email_templates.service'

interface EditEmailTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSuccess: () => void
}

export default function EditEmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: EditEmailTemplateDialogProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [descriptionHtml, setDescriptionHtml] = useState('')
  const editorRef = useRef<TipTapRichTextEditorRef>(null)

  useEffect(() => {
    if (template && open) {
      setTitle(template.title || '')
      setDescriptionHtml(template.description || '')
    }
  }, [template?.id, open])

  const handleSave = async () => {
    if (!template) return

    setIsLoading(true)

    try {
      const payload: EmailTemplatePayload = {
        title,
        description: descriptionHtml
      }

      await EmailTemplateService.update(template.id, payload)
      toast.success('Email template updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch {
      toast.error('Failed to update email template')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSave()
  }

  const placeholders = [
    { label: 'Customer Name', value: '{{CustomerName}}' },
    { label: 'Task Name', value: '{{TaskName}}' },
    { label: 'Date Time', value: '{{DateTime}}' },
    { label: 'Company Name', value: '{{CompanyName}}' },
    { label: 'Phone Number', value: '{{PhoneNumber}}' }
  ]

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      editorRef.current.insertText(` ${placeholder} `)

      return
    }

    setDescriptionHtml(prev => `${prev} ${placeholder} `)
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Email Template'
      description='Update the email template content'
      maxWidth='4xl'
      isLoading={isLoading}
      actions={
        <>
          <Button variant='outline' type='button' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' form='edit-email-template-form' disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id='edit-email-template-form' onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='title'>
            Template Title <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder='Enter template title'
          />
        </div>

        <div className='space-y-2'>
          <Label>Available Placeholders</Label>
          <div className='flex flex-wrap gap-2'>
            {placeholders.map(placeholder => (
              <Button
                key={placeholder.value}
                type='button'
                variant='outline'
                size='sm'
                onClick={() => insertPlaceholder(placeholder.value)}
                className='text-xs'
              >
                {placeholder.label}
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <Label>
            Template Content <span className='text-destructive'>*</span>
          </Label>
          <TipTapRichTextEditor
            ref={editorRef}
            value={descriptionHtml}
            onChange={setDescriptionHtml}
            placeholder='Enter template content...'
            disabled={isLoading}
          />
        </div>
      </form>
    </CommonDialog>
  )
}
