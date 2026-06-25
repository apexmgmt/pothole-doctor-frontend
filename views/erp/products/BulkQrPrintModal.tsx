'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import ProductService from '@/services/api/products/products.service'
import NonInventoryProductService from '@/services/api/products/non-inventory-products.service'
import CustomFormField from '@/components/form/CustomFormField'
import { generateFileUrl } from '@/utils/utility'
import { SpinnerCustom } from '@/components/ui/spinner'

interface BulkQrPrintModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedIds: string[]
  type: 'inventory' | 'non_inventory'
}

interface FormData {
  description_by: 'Product Name' | 'Product Style' | 'Product SKU'
  show_scan_for_pricing: boolean
  print_roll: boolean
}

export interface ProductQrData {
  id: string | number
  vendor_product_name: string | null
  private_product_name: string | null
  vendor_color: string | null
  private_color: string | null
  vendor_style: string | null
  private_style: string | null
  sku: string | null
  product_cost: number | null
  margin: number | null
  selling_price: number | null
  qr_code: string | null
}

const BulkQrPrintModal: React.FC<BulkQrPrintModalProps> = ({ open, onOpenChange, selectedIds, type }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [qrData, setQrData] = useState<ProductQrData[]>([])

  const form = useForm<FormData>({
    defaultValues: {
      description_by: 'Product Style',
      show_scan_for_pricing: false,
      print_roll: false
    }
  })

  const {
    control,
    register,
    formState: { errors },
    watch
  } = form

  const descriptionBy = watch('description_by')
  const showScanForPricing = watch('show_scan_for_pricing')
  const printRoll = watch('print_roll')

  useEffect(() => {
    if (open && selectedIds.length > 0) {
      fetchQrData()
    } else {
      setQrData([])
    }
  }, [open, JSON.stringify(selectedIds)])

  const fetchQrData = async () => {
    setIsLoading(true)

    try {
      const payload = { ids: selectedIds }
      let res

      if (type === 'inventory') {
        res = await ProductService.bulkQrCode(payload)
      } else {
        res = await NonInventoryProductService.bulkQrCode(payload)
      }

      if (res && res.data) {
        setQrData(res.data)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch QR codes')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById('qr-print-area')

    if (!printContent) return

    const iframe = document.createElement('iframe')

    iframe.style.position = 'absolute'
    iframe.style.width = '0px'
    iframe.style.height = '0px'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document

    if (doc) {
      doc.open()
      doc.write(`
        <html>
          <head>
            <title>Print QR Codes</title>
            <style>
              @page { size: portrait; margin: 15mm; }
              body { font-family: sans-serif; margin: 0; padding: 0; }
              .grid-layout { display: grid; grid-template-columns: repeat(4, 1fr); column-gap: 20px; row-gap: 50px; }
              .grid-layout .qr-item { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; text-align: center; page-break-inside: avoid; }
              .roll-layout { display: block; }
              .roll-layout .qr-item { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; page-break-after: always; break-after: page; padding-top: 20px; }
              .roll-layout .qr-item:last-child { page-break-after: auto; break-after: auto; }
              
              .qr-text { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
              .pricing-text { font-size: 12px; font-weight: bold; font-style: italic; margin-bottom: 4px; }
              .qr-img { width: 140px; height: 140px; object-fit: contain; }
              
              .roll-layout .qr-text { font-size: 24px; margin-bottom: 12px; }
              .roll-layout .pricing-text { font-size: 20px; margin-bottom: 8px; }
              .roll-layout .qr-img { width: 300px; height: 300px; }
            </style>
          </head>
          <body>
            <div class="${printRoll ? 'roll-layout' : 'grid-layout'}">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `)
      doc.close()

      iframe.onload = () => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }
    }
  }

  const fieldStyle = 'grid grid-cols-[200px_minmax(200px,_1fr)] items-center'
  const labelStyle = 'justify-end self-start text-right pt-1'

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Product QR'
      disableClose={isLoading}
      className='sm:max-w-4xl max-h-[90vh] flex flex-col'
      actions={
        <div className='flex gap-3'>
          <Button
            type='button'
            size='sm'
            onClick={handlePrint}
            disabled={isLoading || qrData.length === 0}
            className='bg-[#3b82f6] hover:bg-[#2563eb] text-white'
          >
            Print QR Codes
          </Button>
        </div>
      }
    >
      <div className='flex flex-col overflow-hidden'>
        <Form {...form}>
          <form className='space-y-4 py-4 shrink-0'>
            <div className='w-full max-w-xl space-y-4'>
              <CustomFormField
                name='description_by'
                type='select'
                label='QR Description By:'
                selectOptions={[
                  { label: 'Product Name', value: 'Product Name' },
                  { label: 'Product Style', value: 'Product Style' },
                  { label: 'Product SKU', value: 'Product SKU' }
                ]}
                control={control}
                register={register}
                errors={errors}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />

              <CustomFormField
                name='show_scan_for_pricing'
                type='checkbox'
                label='Show/Hide "SCAN FOR PRICING":'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />

              <CustomFormField
                label='Print Roll'
                name='print_roll'
                type='switch'
                control={control}
                register={register}
                errors={errors}
                fieldClassName={`${fieldStyle} [&>button]:order-2 [&>label]:order-1`}
                labelClassName={labelStyle}
              />
              {/* <span className='text-sm font-medium'>{printRoll ? 'Yes' : 'No'}</span> */}
            </div>
          </form>
        </Form>

        <div className='relative flex-1 overflow-y-auto p-8 bg-white min-h-100 rounded-lg'>
          {isLoading ? (
            <SpinnerCustom className='text-primary' />
          ) : (
            <div
              id='qr-print-area'
              className={printRoll ? 'flex flex-col items-start gap-10' : 'grid grid-cols-4 gap-10'}
            >
              {qrData.map(product => {
                let desc = ''

                if (descriptionBy === 'Product Name') {
                  desc = product.private_product_name || product.vendor_product_name || ''
                } else if (descriptionBy === 'Product Style') {
                  desc = product.private_style || product.vendor_style || ''
                } else if (descriptionBy === 'Product SKU') {
                  desc = product.sku || ''
                }

                return (
                  <div key={product.id} className='qr-item flex flex-col items-center text-center justify-center'>
                    {showScanForPricing && (
                      <div className='pricing-text text-xs font-bold italic mb-1 text-black'>
                        ** SCAN FOR PRICING! **
                      </div>
                    )}
                    <div className='qr-text text-xs font-bold mb-2 text-black'>{desc}</div>
                    {product.qr_code && (
                      <img
                        src={generateFileUrl(product.qr_code) || ''}
                        alt='QR Code'
                        className='w-32 h-32 object-contain qr-img'
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </CommonDialog>
  )
}

export default BulkQrPrintModal
