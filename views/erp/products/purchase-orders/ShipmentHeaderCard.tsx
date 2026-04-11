'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/datePicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { BusinessLocation, Courier, Warehouse } from '@/types'
import { PurchaseOrder } from '@/types/products/purchase_orders'
import { formatDate } from '@/utils/date'

import { IncorrectFlags, ShipmentFormState } from './shipment-arrival.types'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ShipmentHeaderCardProps {
  purchaseOrder: PurchaseOrder | null
  form: ShipmentFormState
  incorrectFlags: IncorrectFlags
  onFormChange: <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => void
  onToggleIncorrect: (flag: keyof IncorrectFlags) => void
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
  onToggleIncorrect
}: ShipmentHeaderCardProps) => {
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
            <div className='flex items-center gap-1.5'>
              <Switch checked={incorrectFlags.departure} onCheckedChange={() => onToggleIncorrect('departure')} />
              <span className='text-xs text-muted-foreground'>Incorrect</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground whitespace-nowrap w-36'>Estimated Arrival</span>
            <div className='flex-1'>
              <ReadOnlyField value={formatDate(purchaseOrder?.est_arrival_date ?? '')} />
            </div>
            <div className='flex items-center gap-1.5'>
              <Switch checked={incorrectFlags.arrival} onCheckedChange={() => onToggleIncorrect('arrival')} />
              <span className='text-xs text-muted-foreground'>Incorrect</span>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground whitespace-nowrap w-36'>Estimated Shipping</span>
            <div className='flex-1'>
              <ReadOnlyField
                value={purchaseOrder?.est_shipping_cost != null ? String(purchaseOrder.est_shipping_cost) : undefined}
              />
            </div>
            <div className='flex items-center gap-1.5'>
              <Switch checked={incorrectFlags.shipping} onCheckedChange={() => onToggleIncorrect('shipping')} />
              <span className='text-xs text-muted-foreground'>Incorrect</span>
            </div>
          </div>

          <div className='space-y-1 pt-1'>
            <Label className='text-xs text-muted-foreground'>Comment</Label>
            <Textarea
              placeholder='Comment...'
              rows={4}
              value={form.comments}
              onChange={e => onFormChange('comments', e.target.value)}
              className='resize-none'
            />
          </div>
        </div>

        {/* Right: Actual fields — shown only when the corresponding Incorrect switch is on */}
        <div className='space-y-3'>
          {incorrectFlags.departure && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Actual Departure</Label>
              <DatePicker
                value={form.actual_departure_date}
                onChange={v => onFormChange('actual_departure_date', v)}
                placeholder='Actual Departure'
              />
            </div>
          )}
          {incorrectFlags.arrival && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>Actual Arrival</Label>
              <DatePicker
                value={form.actual_arrival_date}
                onChange={v => onFormChange('actual_arrival_date', v)}
                placeholder='Actual Arrival'
              />
            </div>
          )}
          {incorrectFlags.shipping && (
            <div className='space-y-1'>
              <Label className='text-xs text-muted-foreground'>
                Shipping Cost <span className='text-destructive'>*</span>
              </Label>
              <Input
                type='number'
                min={0}
                step='any'
                placeholder='0'
                value={form.actual_shipping_cost}
                onChange={e => onFormChange('actual_shipping_cost', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ShipmentHeaderCard
