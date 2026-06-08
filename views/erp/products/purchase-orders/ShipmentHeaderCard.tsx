'use client'

import { useRef } from 'react'

import {
  Check,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImageIcon,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
  XCircle
} from 'lucide-react'

import { Textarea } from '@/components/ui/textarea'
import { BusinessLocation, Courier, Document, Warehouse } from '@/types'
import { PurchaseOrder } from '@/types/products/purchase_orders'
import { formatDate } from '@/utils/date'
import { generateFileUrl, getFileType } from '@/utils/utility'
import { cn } from '@/lib/utils'
import CustomFormField from '@/components/form/CustomFormField'

import { IncorrectFlags, ShipmentFormState } from './shipment-arrival.types'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ShipmentHeaderCardProps {
  purchaseOrder: PurchaseOrder | null
  form: ShipmentFormState
  incorrectFlags: IncorrectFlags
  onFormChange: <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => void
  onToggleIncorrect: (flag: keyof IncorrectFlags) => void
  viewOnly?: boolean
  documents?: Document[]
  isUploadingDoc?: boolean
  onUploadDoc?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDeleteDoc?: (id: string) => void
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ReadOnlyField = ({ value, className }: { value: string | number | null | undefined; className?: string }) => (
  <div
    className={`flex items-center h-9 px-3 rounded-md border border-border bg-muted text-sm text-muted-foreground min-w-0 ${className ?? ''}`}
  >
    {value ?? '—'}
  </div>
)

const displayField = (label: string, value: React.ReactNode, index?: number) => {
  const isFirst2 = index !== undefined && index % 2 === 0
  const isFirst3 = index !== undefined && index % 3 === 0
  const isFirst4 = index !== undefined && index % 4 === 0
  const isFirst5 = index !== undefined && index % 5 === 0

  const borderClass = cn(
    isFirst2 ? 'border-l-0 pl-0' : 'border-l border-border pl-3',
    isFirst3 ? 'sm:border-l-0 sm:pl-0' : 'sm:border-l sm:border-border sm:pl-3',
    isFirst4 ? 'md:border-l-0 md:pl-0' : 'md:border-l md:border-border md:pl-3',
    isFirst5 ? 'lg:border-l-0 lg:pl-0' : 'lg:border-l lg:border-border lg:pl-3'
  )

  return (
    <div key={`${label}-${index}`} className={cn('flex flex-col gap-1.25', borderClass)}>
      <span className='text-xs text-muted-foreground font-normal leading-none'>{label}</span>
      <span className='text-[13px] font-medium leading-tight'>{value ?? '-'}</span>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ShipmentHeaderCard = ({
  purchaseOrder,
  form,
  incorrectFlags,
  onFormChange,
  onToggleIncorrect,
  viewOnly = false,
  documents = [],
  isUploadingDoc = false,
  onUploadDoc,
  onDeleteDoc
}: ShipmentHeaderCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fieldStyle = 'grid grid-cols-[128px_minmax(0,_1fr)] gap-2'
  const labelStyle = 'justify-end items-start self-start text-right pt-1.5'

  const renderWarehouseName = () => {
    if (!purchaseOrder) return '—'
    if (purchaseOrder.warehouse_type === 'warehouse') return (purchaseOrder.warehouse as Warehouse)?.title ?? '—'

    return (purchaseOrder.warehouse as BusinessLocation)?.name ?? '—'
  }

  return (
    <div className='space-y-4'>
      {/* Shipment metadata columns */}
      <div className='p-2.5 bg-[#1F1F1F] rounded-lg'>
        <div className='flex items-center gap-3'>
          <p className='text-xs leading-none text-muted-foreground'>PO #</p>
          <div className='bg-[#FFC31C14] p-[7px] border border-border rounded-lg'>
            <p className='text-[11px] leading-none text-light'>
              {purchaseOrder ? `PO-${purchaseOrder.purchase_order_number?.toString().padStart(4, '0') ?? '—'}` : '-'}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 mt-2'>
          {[
            { label: 'Reference Number', value: purchaseOrder?.reference_number },
            { label: 'Carrier', value: (purchaseOrder?.courier as Courier)?.name },
            {
              label: 'Vendor',
              value: purchaseOrder?.vendor
                ? `${purchaseOrder.vendor.first_name ?? ''} ${purchaseOrder.vendor.last_name ?? ''}`.trim()
                : undefined
            },
            { label: 'Location', value: renderWarehouseName() },
            { label: 'Lot Number', value: purchaseOrder?.lot_number }
          ].map((field, idx) => displayField(field.label, field.value, idx))}
        </div>
      </div>

      {/* Estimated fields (with Incorrect toggles) and conditional Actual fields */}
      <div className='space-y-2 p-4 border border-border rounded-lg'>
        {/* Row 1: Departure */}
        <div className='w-full grid grid-cols-[minmax(0,_1fr)_100px_minmax(0,_1fr)] gap-3'>
          <CustomFormField
            label='Estimated Departure'
            value={purchaseOrder?.est_departure_date ? formatDate(purchaseOrder.est_departure_date) : '—'}
            readonly
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
            className='cursor-default'
          />

          {!viewOnly ? (
            <button type='button' onClick={() => onToggleIncorrect('departure')} className='relative cursor-pointer'>
              <span
                className={`absolute left-0 bottom-1/2 translate-y-1/2 size-6 flex justify-center items-center border rounded-full ${incorrectFlags.departure ? 'bg-[#35292A] border-[#FF383C1F]' : 'bg-[#29322B] border-[#34C7591F]'}`}
              >
                {incorrectFlags.departure ? (
                  <X className='size-4 text-[#FF383C]' />
                ) : (
                  <Check className='size-4 text-[#34C759]' />
                )}
              </span>
              <span className='block min-w-18 text-xs leading-none text-center ps-3 pe-2 py-0.75 bg-[#1F1F1F] border border-border rounded-full'>
                {incorrectFlags.departure ? 'Incorrect' : 'Correct'}
              </span>
            </button>
          ) : (
            <div />
          )}

          {incorrectFlags.departure && (
            <div className='flex-1'>
              <CustomFormField
                name='actual_departure_date'
                label='Actual Departure'
                type='datepicker'
                placeholder='Select date'
                value={form.actual_departure_date ? (formatDate(form.actual_departure_date) ?? '') : ''}
                onChange={(v: any) => onFormChange('actual_departure_date', v ? new Date(v) : null)}
                readonly={viewOnly}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>
          )}
        </div>

        {/* Row 2: Arrival */}
        <div className='w-full grid grid-cols-[minmax(0,_1fr)_100px_minmax(0,_1fr)] gap-3'>
          <CustomFormField
            label='Estimated Arrival'
            value={purchaseOrder?.est_arrival_date ? formatDate(purchaseOrder.est_arrival_date) : '—'}
            readonly
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
            className='cursor-default'
          />

          {!viewOnly ? (
            <button type='button' onClick={() => onToggleIncorrect('arrival')} className='relative cursor-pointer'>
              <span
                className={`absolute left-0 bottom-1/2 translate-y-1/2 size-6 flex justify-center items-center border rounded-full ${incorrectFlags.arrival ? 'bg-[#35292A] border-[#FF383C1F]' : 'bg-[#29322B] border-[#34C7591F]'}`}
              >
                {incorrectFlags.arrival ? (
                  <X className='size-4 text-[#FF383C]' />
                ) : (
                  <Check className='size-4 text-[#34C759]' />
                )}
              </span>
              <span className='block min-w-18 text-xs leading-none text-center ps-3 pe-2 py-0.75 bg-[#1F1F1F] border border-border rounded-full'>
                {incorrectFlags.arrival ? 'Incorrect' : 'Correct'}
              </span>
            </button>
          ) : (
            <div />
          )}

          {incorrectFlags.arrival && (
            <div className='flex-1'>
              <CustomFormField
                name='actual_arrival_date'
                label='Actual Arrival'
                type='datepicker'
                placeholder='Select date'
                value={form.actual_arrival_date ? (formatDate(form.actual_arrival_date) ?? '') : ''}
                onChange={(v: any) => onFormChange('actual_arrival_date', v ? new Date(v) : null)}
                readonly={viewOnly}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>
          )}
        </div>

        {/* Row 3: Shipping */}
        <div className='w-full grid grid-cols-[minmax(0,_1fr)_100px_minmax(0,_1fr)] gap-3'>
          <CustomFormField
            label='Estimated Shipping'
            value={purchaseOrder?.est_shipping_cost != null ? String(purchaseOrder.est_shipping_cost) : '—'}
            readonly
            fieldClassName={fieldStyle}
            labelClassName={labelStyle}
            className='cursor-default'
          />

          {!viewOnly ? (
            <button type='button' onClick={() => onToggleIncorrect('shipping')} className='relative cursor-pointer'>
              <span
                className={`absolute left-0 bottom-1/2 translate-y-1/2 size-6 flex justify-center items-center border rounded-full ${incorrectFlags.shipping ? 'bg-[#35292A] border-[#FF383C1F]' : 'bg-[#29322B] border-[#34C7591F]'}`}
              >
                {incorrectFlags.shipping ? (
                  <X className='size-4 text-[#FF383C]' />
                ) : (
                  <Check className='size-4 text-[#34C759]' />
                )}
              </span>
              <span className='block min-w-18 text-xs leading-none text-center ps-3 pe-2 py-0.75 bg-[#1F1F1F] border border-border rounded-full'>
                {incorrectFlags.shipping ? 'Incorrect' : 'Correct'}
              </span>
            </button>
          ) : (
            <div />
          )}

          {incorrectFlags.shipping && (
            <div className='flex-1'>
              <CustomFormField
                name='actual_shipping_cost'
                label='Shipping Cost'
                type='number'
                placeholder='0'
                rules={{ required: true }}
                value={form.actual_shipping_cost}
                onChange={(v: any) => onFormChange('actual_shipping_cost', v)}
                readonly={viewOnly}
                fieldClassName={fieldStyle}
                labelClassName={labelStyle}
              />
            </div>
          )}
        </div>

        {/* Comment Row */}
        <CustomFormField
          label='Comment'
          type='textarea'
          placeholder='Comment...'
          value={form.comments}
          onChange={v => onFormChange('comments', v as string)}
          readonly={viewOnly}
          fieldClassName={`${fieldStyle} mt-4`}
          labelClassName={labelStyle}
        />
      </div>

      {/* ─── Documents ─────────────────────────────────────────────────── */}
      <div className='rounded-md border border-border overflow-hidden mt-1'>
        <div className='flex items-center justify-between px-4 py-2 bg-border/10 border-b border-border'>
          <div className='flex items-center gap-2'>
            <Paperclip className='w-3.5 h-3.5 text-muted-foreground' />
            <span className='text-xs font-medium'>Attachments</span>
            {documents.length > 0 && <span className='text-xs text-muted-foreground'>({documents.length})</span>}
          </div>
          {!viewOnly && (
            <>
              <input
                ref={fileInputRef}
                type='file'
                accept='*'
                className='hidden'
                onChange={e => {
                  onUploadDoc?.(e)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              />
              <button
                type='button'
                disabled={isUploadingDoc}
                onClick={() => fileInputRef.current?.click()}
                className='flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50'
              >
                <UploadCloud className='w-3.5 h-3.5' />
                {isUploadingDoc ? 'Uploading...' : 'Upload File'}
              </button>
            </>
          )}
        </div>

        {documents.length === 0 ? (
          <div className='px-4 py-5 text-center text-xs text-muted-foreground'>No documents attached.</div>
        ) : (
          <ul className='divide-y divide-border'>
            {documents.map(doc => {
              const url = generateFileUrl(doc.full_path) ?? '#'
              const type = getFileType(doc.full_path)

              return (
                <li key={doc.id} className='flex items-center gap-3 px-4 py-2 hover:bg-border/10 transition-colors'>
                  {type === 'image' ? (
                    <ImageIcon className='w-3.5 h-3.5 text-sky-500 shrink-0' />
                  ) : (
                    <FileText className='w-3.5 h-3.5 text-amber-500 shrink-0' />
                  )}
                  <span className='flex-1 text-xs truncate' title={doc.name}>
                    {doc.name}
                  </span>
                  <a
                    href={url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-primary transition-colors'
                    title='Open file'
                  >
                    <ExternalLink className='w-3.5 h-3.5' />
                  </a>
                  {!viewOnly && (
                    <button
                      type='button'
                      onClick={() => onDeleteDoc?.(doc.id)}
                      className='text-muted-foreground hover:text-destructive transition-colors'
                      title='Delete document'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ShipmentHeaderCard
