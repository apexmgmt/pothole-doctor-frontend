'use client'

import { useState } from 'react'

import Image from 'next/image'

import { ImageIcon, Trash2, Upload, Loader2 } from 'lucide-react'

import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

import ProductGalleryService from '@/services/api/products/product-galleries.service'

import { generateFileUrl } from '@/utils/utility'
import { ProductGallery } from '@/types'

interface ProductGallerySectionProps {
  productId: string
  galleries: ProductGallery[]
  isLoading: boolean
  onUpdate: () => void
  disabled?: boolean
}

export function ProductGallerySection({
  productId,
  galleries,
  isLoading,
  onUpdate,
  disabled = false
}: ProductGallerySectionProps) {
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    // Validate all files
    const validFiles: File[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()

      formData.append('product_id', productId)

      // Append all valid files
      validFiles.forEach(file => {
        formData.append('images[]', file)
      })

      await ProductGalleryService.store(formData)
      toast.success(`${validFiles.length} image(s) uploaded successfully`)
      onUpdate()

      // Reset input
      e.target.value = ''
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload images')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async (galleryId: string) => {
    setDeletingId(galleryId)

    try {
      await ProductGalleryService.destroy(galleryId)
      toast.success('Image deleted successfully')
      onUpdate()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Upload Button */}
      {!disabled && (
        <div className='relative'>
          <Input
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className='hidden'
            id='gallery-upload'
          />
          <label htmlFor='gallery-upload'>
            <Button type='button' variant='outline' className='w-full' disabled={uploadingImage} asChild>
              <span className='flex items-center gap-2 cursor-pointer'>
                {uploadingImage ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4' />
                    Upload Images
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      )}

      {/* Gallery Grid */}
      {galleries.length === 0 ? (
        <Card className='p-8 text-center border-dashed'>
          <ImageIcon className='h-12 w-12 mx-auto mb-3 text-gray-400' />
          <p className='text-sm text-gray-500'>No images uploaded yet</p>
          {!disabled && <p className='text-xs text-gray-400 mt-1'>Upload your first images to get started</p>}
        </Card>
      ) : (
        <div className='grid grid-cols-2 gap-3'>
          {galleries.map(gallery => (
            <Card key={gallery.id} className='relative group overflow-hidden'>
              <div className='aspect-square relative'>
                <Image
                  src={generateFileUrl(gallery.full_path) || '/images/placeholder-image.png'}
                  alt={gallery.name || 'Product gallery'}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 300px'
                />
                {!disabled && (
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      onClick={() => handleDeleteImage(gallery.id)}
                      disabled={deletingId === gallery.id}
                    >
                      {deletingId === gallery.id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
