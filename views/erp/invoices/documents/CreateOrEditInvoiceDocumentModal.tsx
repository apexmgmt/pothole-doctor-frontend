'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Document } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { generateFileUrl, getFileType } from '@/utils/utility'
import InvoiceDocumentService from '@/services/api/invoices/invoice-documents.service'

interface CreateOrEditInvoiceDocumentModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: string
  documentId?: string
  documentDetails?: Document
  onSuccess?: () => void
}

interface FormValues {
  file: File | null
}

const CreateOrEditInvoiceDocumentModal = ({
  mode = 'create',
  open,
  onOpenChange,
  invoiceId,
  documentId,
  documentDetails,
  onSuccess
}: CreateOrEditInvoiceDocumentModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    defaultValues: { file: null }
  })

  useEffect(() => {
    if (open) {
      form.reset({ file: null })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [documentDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    if (mode === 'create' && !values.file) {
      form.setError('file', { message: 'Please upload a file' })

      return
    }

    setIsLoading(true)

    const formData = new FormData()

    formData.append('invoice_id', invoiceId)

    if (values.file) {
      formData.append('file', values.file)
    }

    try {
      if (mode === 'create') {
        await InvoiceDocumentService.store(formData)
        toast.success('Document added successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && documentId) {
        await InvoiceDocumentService.update(documentId, formData)
        toast.success('Document updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.map((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    form.reset({ file: null })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    onOpenChange(false)
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading document...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Add Document' : 'Edit Document'}
      description={mode === 'create' ? 'Upload a document for this invoice' : 'Replace the existing document'}
      maxWidth='sm'
      disableClose={form.formState.isSubmitting}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Upload' : 'Update'}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='file'
            rules={
              mode === 'create'
                ? { required: 'File is required', validate: value => (!value ? 'Please select a file' : true) }
                : undefined
            }
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>
                  File <span className='text-red-500'>*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type='file'
                    accept='*'
                    placeholder='Upload file'
                    {...field}
                    onChange={e => {
                      const file = e.target.files?.[0] || null

                      onChange(file)
                    }}
                  />
                </FormControl>
                {mode === 'edit' && documentDetails?.full_path && (
                  <div className='mt-2'>
                    <span className='text-xs text-gray-500'>Current file:&nbsp;</span>
                    {getFileType(generateFileUrl(documentDetails.full_path) ?? '') === 'image' ? (
                      <a
                        href={generateFileUrl(documentDetails.full_path) ?? ''}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-block'
                      >
                        <img
                          src={generateFileUrl(documentDetails.full_path) ?? ''}
                          alt='Current file'
                          className='h-16 rounded'
                        />
                      </a>
                    ) : (
                      <a
                        href={generateFileUrl(documentDetails.full_path) ?? ''}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 underline'
                      >
                        View current file
                      </a>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CommonDialog>
  )
}

export default CreateOrEditInvoiceDocumentModal
