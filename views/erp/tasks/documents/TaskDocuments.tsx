'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PlusIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DocumentIcon } from '@/public/icons'
import TaskDocumentService from '@/services/api/tasks/task-documents.service'
import { DataTableApiResponse, Document } from '@/types'
import { generateFileUrl, getFileType } from '@/utils/utility'

interface TaskDocumentsProps {
  taskId?: string
}

const TaskDocuments = ({ taskId }: TaskDocumentsProps) => {
  const [apiResponse, setApiResponse] = useState<DataTableApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchDocuments = async () => {
    if (!taskId) {
      setApiResponse(null)

      return
    }

    setIsLoading(true)

    try {
      const response = await TaskDocumentService.index({
        page: 1,
        per_page: 100,
        searchable_id: taskId
      })

      setApiResponse(response?.data || null)
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Error fetching task documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchDocuments()
  }, [taskId])

  const handleOpenUpload = () => {
    if (!taskId || isUploading) return

    fileInputRef.current?.click()
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file || !taskId) return

    const formData = new FormData()

    formData.append('task_id', taskId)
    formData.append('file', file)

    setIsUploading(true)

    try {
      await TaskDocumentService.store(formData)
      toast.success('Document uploaded successfully')
      await fetchDocuments()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((messages: any) => {
          if (Array.isArray(messages)) {
            messages.forEach(message => {
              toast.error(String(message))
            })
          }
        })
      } else {
        toast.error(typeof error?.message === 'string' ? error.message : 'Failed to upload document')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    setDeletingId(documentId)

    try {
      await TaskDocumentService.destroy(documentId)
      toast.success('Document deleted successfully')
      await fetchDocuments()
    } catch (error: any) {
      toast.error(typeof error?.message === 'string' ? error.message : 'Failed to delete document')
    } finally {
      setDeletingId(null)
    }
  }

  const documents = (apiResponse?.data || []) as Document[]

  return (
    <div className='rounded-md border border-border p-4 space-y-3'>
      <div className='flex items-center justify-between gap-2'>
        <h4 className='text-sm font-semibold'>Task Attachments</h4>
        <Button type='button' size='sm' onClick={handleOpenUpload} disabled={!taskId || isUploading || isLoading}>
          <PlusIcon className='h-4 w-4' />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        className='hidden'
        onChange={handleUpload}
        disabled={!taskId || isUploading}
      />

      {isLoading ? <p className='text-xs text-muted-foreground'>Loading attachments...</p> : null}

      {!isLoading && documents.length === 0 ? (
        <p className='text-xs text-muted-foreground'>No attachments found.</p>
      ) : null}

      <div className='space-y-2 max-h-72 overflow-auto pr-1'>
        {documents.map(document => {
          const fileUrl = generateFileUrl(document.full_path)
          const fileType = getFileType(fileUrl || '')

          return (
            <div
              key={document.id}
              className='flex items-center justify-between gap-2 rounded-md border border-border p-2'
            >
              <Link
                href={fileUrl || '#'}
                target='_blank'
                rel='noopener noreferrer'
                className='flex min-w-0 flex-1 items-center gap-2'
              >
                {fileType === 'image' ? (
                  <Image
                    src={fileUrl || ''}
                    alt={document.name}
                    width={40}
                    height={40}
                    unoptimized
                    className='h-10 w-10 rounded object-cover'
                  />
                ) : fileType === 'video' ? (
                  <video className='h-10 w-10 rounded object-cover' muted>
                    <source src={fileUrl || ''} type='video/mp4' />
                  </video>
                ) : (
                  <DocumentIcon className='h-8 w-8 shrink-0' />
                )}
                <span className='truncate text-xs'>{document.name}</span>
              </Link>

              <Button
                type='button'
                variant='ghost'
                size='icon-sm'
                onClick={() => handleDelete(document.id)}
                disabled={deletingId === document.id}
                aria-label='Delete Document'
              >
                <Trash2 className='h-4 w-4 text-destructive' />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TaskDocuments
