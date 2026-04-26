'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { PlusIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import DeleteButton from '@/components/erp/common/buttons/DeleteButton'
import { InvoiceJobImage } from '@/types/invoices'
import InvoiceJobImageService from '@/services/api/invoices/invoice-job-images.service'
import { generateFileUrl } from '@/utils/utility'

interface InvoiceJobImagesProps {
  invoiceId: string
  type: 'before' | 'after'
  canEditInvoice?: boolean
}

const InvoiceJobImages = ({ invoiceId, type, canEditInvoice = false }: InvoiceJobImagesProps) => {
  const [images, setImages] = useState<InvoiceJobImage[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchImages = async () => {
    setIsLoading(true)

    try {
      const response = await InvoiceJobImageService.index(invoiceId, type)

      setImages(response.data || [])
    } catch {
      toast.error(`Failed to fetch ${type} images`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [invoiceId, type])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setIsUploading(true)

    const formData = new FormData()

    formData.append('invoice_id', invoiceId)
    formData.append('image', file)
    formData.append('type', type)

    try {
      await InvoiceJobImageService.store(formData)
      toast.success('Image uploaded successfully')
      fetchImages()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((errMsg: any) => {
          errMsg?.forEach((msg: string) => toast.error(msg))
        })
      } else {
        toast.error(error?.message || 'Failed to upload image')
      }
    } finally {
      setIsUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      await InvoiceJobImageService.delete(imageId)
      toast.success('Image deleted successfully')
      fetchImages()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete image')
    }
  }

  return (
    <div className='p-4'>
      <div className='flex items-center justify-end mb-4'>
        {canEditInvoice && (
          <>
            <input type='file' accept='image/*' ref={fileInputRef} className='hidden' onChange={handleFileChange} />
            <Button
              variant='default'
              size='sm'
              className='bg-light text-bg hover:bg-light/90'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <PlusIcon className='w-4 h-4' />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className='text-center py-12 text-muted-foreground'>Loading images...</div>
      ) : images.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          No {type} images found. Upload one to get started.
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {images.map(image => {
            const imageUrl = generateFileUrl(image.full_path)

            return (
              <div key={image.id} className='relative group rounded-lg overflow-hidden border bg-muted'>
                {imageUrl && (
                  <a href={imageUrl} target='_blank' rel='noopener noreferrer'>
                    <Image
                      src={imageUrl}
                      alt={image.name}
                      width={200}
                      height={160}
                      unoptimized
                      className='w-full h-40 object-cover'
                    />
                  </a>
                )}
                <div className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {canEditInvoice && (
                    <DeleteButton
                      tooltip='Delete Image'
                      variant='icon'
                      buttonVariant='destructive'
                      onClick={() => handleDelete(image.id)}
                    />
                  )}
                </div>
                <div className='px-2 py-1 text-xs text-muted-foreground truncate'>{image.name}</div>
                <div className='px-2 py-1 text-xs text-muted-foreground truncate'>
                  {image?.uploaded_by?.first_name && 'Uploaded by: '}
                  {image?.uploaded_by?.first_name && image.uploaded_by.first_name + ' ' + image.uploaded_by.last_name}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default InvoiceJobImages
