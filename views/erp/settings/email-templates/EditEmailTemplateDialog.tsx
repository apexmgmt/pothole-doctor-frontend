'use client'

import { useEffect, useRef, useState } from 'react'

import { toast } from 'sonner'

import { EmailTemplate, EmailTemplatePayload } from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CustomFormField from '@/components/form/CustomFormField'
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
  const [selectedPlaceholder, setSelectedPlaceholder] = useState('')

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
    { label: 'Company Name', value: '{{CompanyName}}' },
    { label: 'Quote URL', value: '{{QuoteURL}}' },
    { label: 'Quote Number', value: '{{QuoteNumber}}' },
    { label: 'Estimate Number', value: '{{EstimateNumber}}' },
    { label: 'Site Address', value: '{{SiteAddress}}' },
    { label: 'Invoice URL', value: '{{InvoiceURL}}' },
    { label: 'Invoice Number', value: '{{invoiceNumber}}' },
    { label: 'Location Name', value: '{{LocationName}}' },
    { label: 'Location Email', value: '{{LocationEmail}}' },
    { label: 'Location Phone', value: '{{LocationPhone}}' },
    { label: 'Location Address', value: '{{LocationAddress}}' },
    { label: 'Customer Name', value: '{{CustomerName}}' },
    { label: 'Customer Email', value: '{{CustomerEmail}}' },
    { label: 'Customer Phone', value: '{{CustomerPhone}}' },
    { label: 'Customer Address', value: '{{CustomerAddress}}' },
    { label: 'Salesman Name', value: '{{SalesmanName}}' },
    { label: 'Salesman Email', value: '{{SalesmanEmail}}' },
    { label: 'Salesman Phone Number', value: '{{SalesmanPhoneNumber}}' },
    { label: 'Name', value: '{{name}}' },
    { label: 'Task Name', value: '{{TaskName}}' },
    { label: 'Date Time', value: '{{DateTime}}' },
    { label: 'Task Type', value: '{{task-type}}' }
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
      maxWidth='5xl'
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
      <form id='edit-email-template-form' onSubmit={handleSubmit} className='space-y-2'>
        <div className='space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <CustomFormField
            type='text'
            name='title'
            label='Template Title'
            value={title}
            onChange={value => setTitle(typeof value === 'string' ? value : '')}
            rules={{ required: 'Template title is required' }}
            placeholder='Enter template title'
            disabled={isLoading}
            fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)]'}
            labelClassName={'justify-end self-start text-right pt-1'}
          />

          <CustomFormField
            type='select'
            name='placeholders'
            label='Available Placeholders'
            placeholder='Select placeholder to insert'
            value={selectedPlaceholder}
            selectOptions={placeholders}
            onChange={value => {
              if (typeof value !== 'string' || value === '') return
              insertPlaceholder(value)
              setSelectedPlaceholder('')
            }}
            disabled={isLoading}
            fieldClassName={'grid grid-cols-[128px_minmax(0,_1fr)]'}
            labelClassName={'justify-end self-start text-right pt-1'}
          />
        </div>
        <div className='space-y-2 grid grid-cols-[128px_minmax(0,1fr)]'>
          <Label className='text-xs font-normal justify-end self-start text-right pt-1 gap-0'>
            Template Content<span className='text-destructive'>*</span>
          </Label>
          <div className='ml-2'>
            <TipTapRichTextEditor
              ref={editorRef}
              value={descriptionHtml}
              onChange={setDescriptionHtml}
              placeholder='Enter template content...'
              disabled={isLoading}
            />
          </div>
        </div>
      </form>
    </CommonDialog>
  )
}
