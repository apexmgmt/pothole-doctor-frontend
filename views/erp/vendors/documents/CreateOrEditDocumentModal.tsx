'use client'

import { useEffect, useRef, useState } from 'react'

import { useForm } from 'react-hook-form'

import { toast } from 'sonner'

import { Document, DocumentPayload } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { generateFileUrl, getFileType } from '@/utils/utility'
import VendorDocumentService from '@/services/api/vendors/vendor-documents.service'

interface CreateOrEditDocumentModalProps {
  mode?: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  vendorId: string
  documentId?: string
  documentDetails?: Document
  onSuccess?: () => void
}

interface FormValues {
  file: File | null
}

const CreateOrEditDocumentModal = ({
  mode = 'create',
  open,
  onOpenChange,
  vendorId,
  documentId,
  documentDetails,
  onSuccess
}: CreateOrEditDocumentModalProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      file: null
    }
  })

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.reset({ file: null })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [documentDetails, open, form])

  const onSubmit = async (values: FormValues) => {
    // Validate file on create
    if (mode === 'create' && !values.file) {
      form.setError('file', { message: 'Please upload a file' })

      return
    }

    setIsLoading(true)

    // Create FormData
    const formData = new FormData()

    formData.append('vendor_id', vendorId)

    if (values.file) {
      formData.append('file', values.file)
    }

    try {
      if (mode === 'create') {
        await VendorDocumentService.store(formData)
        toast.success('Document added successfully')
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else if (mode === 'edit' && documentId) {
        await VendorDocumentService.update(documentId, formData)
        toast.success('Document updated successfully')
        onOpenChange(false)
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(
        error?.message
          ? typeof error.message === 'string'
            ? error.message
            : 'Failed to save document'
          : 'Something went wrong!'
      )
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
      title={mode === 'create' ? 'Create New Document' : 'Edit Document'}
      description={mode === 'create' ? 'Add a new document to the system' : 'Update document information'}
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
            {form.formState.isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
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
                ? {
                    required: 'File is required',
                    validate: value => {
                      if (!value) return 'Please select a file'

                      return true
                    }
                  }
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
                    
                    // ref={fileInputRef}
                    {...field}
                    onChange={e => {
                      const file = e.target.files?.[0] || null

                      onChange(file)
                    }}
                  />
                </FormControl>
                {/* Show current file if editing */}
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

export default CreateOrEditDocumentModal
