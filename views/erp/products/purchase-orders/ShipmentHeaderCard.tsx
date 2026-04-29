'use client'

import { useRef } from 'react'

import { ExternalLink, FileText, ImageIcon, Paperclip, Trash2, UploadCloud } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { BusinessLocation, Courier, Document, Warehouse } from '@/types'
import { PurchaseOrder } from '@/types/products/purchase_orders'
import { formatDate } from '@/utils/date'
import { generateFileUrl, getFileType } from '@/utils/utility'

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

  const renderWarehouseName = () => {
    if (!purchaseOrder) return '—'
    if (purchaseOrder.warehouse_type === 'warehouse') return (purchaseOrder.warehouse as Warehouse)?.title ?? '—'

    return (purchaseOrder.warehouse as BusinessLocation)?.name ?? '—'
  }

  return (
    <Card className='p-4 space-y-3'>
      {/* Row 1: PO#, Reference Number, Carrier */}
      <div className='grid grid-cols-3 gap-4 items-center'>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-28'>PO #</span>
          {purchaseOrder ? (
            <Badge variant='info' className='text-sm'>
              PO-{purchaseOrder.purchase_order_number?.toString().padStart(4, '0') ?? '—'}
            </Badge>
          ) : (
            <span className='text-muted-foreground text-sm'>—</span>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-32'>Reference Number</span>
          <ReadOnlyField value={purchaseOrder?.reference_number} className='flex-1' />
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-14'>Carrier</span>
          <ReadOnlyField value={(purchaseOrder?.courier as Courier)?.name} className='flex-1' />
        </div>
      </div>

      {/* Row 2: Vendor, Location, Lot Number */}
      <div className='grid grid-cols-3 gap-4 items-center'>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-28'>Vendor</span>
          <ReadOnlyField
            value={
              purchaseOrder?.vendor
                ? `${purchaseOrder.vendor.first_name ?? ''} ${purchaseOrder.vendor.last_name ?? ''}`.trim()
                : undefined
            }
            className='flex-1'
          />
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-32'>Location</span>
          <ReadOnlyField value={renderWarehouseName()} className='flex-1' />
        </div>
        <div className='flex items-center gap-3'>
          <span className='text-xs text-muted-foreground whitespace-nowrap w-14'>Lot Number</span>
          <ReadOnlyField value={purchaseOrder?.lot_number} className='flex-1' />
        </div>
      </div>

      {/* Row 3: Estimated (with Incorrect toggles) on left, Actual fields on right */}
      <div className='grid grid-cols-2 gap-8 pt-1'>
        {/* Left: Estimated fields + Comment */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground whitespace-nowrap w-36'>Estimated Departure</span>
            <div className='flex-1'>
              <ReadOnlyField value={formatDate(purchaseOrder?.est_departure_date ?? '')} />
            </div>
            {!viewOnly && (
              <div className='flex items-center gap-1.5'>
                <Switch checked={incorrectFlags.departure} onCheckedChange={() => onToggleIncorrect('departure')} />
                <span className='text-xs text-muted-foreground'>Incorrect</span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground whitespace-nowrap w-36'>Estimated Arrival</span>
            <div className='flex-1'>
              <ReadOnlyField value={formatDate(purchaseOrder?.est_arrival_date ?? '')} />
            </div>
            {!viewOnly && (
              <div className='flex items-center gap-1.5'>
                <Switch checked={incorrectFlags.arrival} onCheckedChange={() => onToggleIncorrect('arrival')} />
                <span className='text-xs text-muted-foreground'>Incorrect</span>
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground whitespace-nowrap w-36'>Estimated Shipping</span>
            <div className='flex-1'>
              <ReadOnlyField
                value={purchaseOrder?.est_shipping_cost != null ? String(purchaseOrder.est_shipping_cost) : undefined}
              />
            </div>
            {!viewOnly && (
              <div className='flex items-center gap-1.5'>
                <Switch checked={incorrectFlags.shipping} onCheckedChange={() => onToggleIncorrect('shipping')} />
                <span className='text-xs text-muted-foreground'>Incorrect</span>
              </div>
            )}
          </div>

          <div className='space-y-1 pt-1'>
            <Label className='text-xs text-muted-foreground'>Comment</Label>
            <Textarea
              placeholder='Comment...'
              rows={4}
              value={form.comments}
              onChange={e => onFormChange('comments', e.target.value)}
              className='resize-none'
              disabled={viewOnly}
            />
          </div>
        </div>

        {/* Right: Actual fields */}
        <div className='space-y-3'>
          {incorrectFlags.departure && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Actual Departure</Label>
              {viewOnly ? (
                <ReadOnlyField value={form.actual_departure_date ? formatDate(form.actual_departure_date) : '—'} />
              ) : (
                <DatePicker
                  value={form.actual_departure_date}
                  onChange={v => onFormChange('actual_departure_date', v)}
                  placeholder='Actual Departure'
                />
              )}
            </div>
          )}
          {incorrectFlags.arrival && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Actual Arrival</Label>
              {viewOnly ? (
                <ReadOnlyField value={form.actual_arrival_date ? formatDate(form.actual_arrival_date) : '—'} />
              ) : (
                <DatePicker
                  value={form.actual_arrival_date}
                  onChange={v => onFormChange('actual_arrival_date', v)}
                  placeholder='Actual Arrival'
                />
              )}
            </div>
          )}
          {incorrectFlags.shipping && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>
                Shipping Cost {!viewOnly && <span className='text-destructive'>*</span>}
              </Label>
              {viewOnly ? (
                <ReadOnlyField value={form.actual_shipping_cost !== '' ? form.actual_shipping_cost : '—'} />
              ) : (
                <Input
                  type='number'
                  min={0}
                  step='any'
                  placeholder='0'
                  value={form.actual_shipping_cost}
                  onChange={e => onFormChange('actual_shipping_cost', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
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
    </Card>
  )
}

export default ShipmentHeaderCard
