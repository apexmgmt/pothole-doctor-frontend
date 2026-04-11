'use client'

import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import PurchaseOrderService from '@/services/api/products/purchase_orders.service'
import { BusinessLocation, Warehouse } from '@/types'
import {
  PurchaseOrder,
  PurchaseOrderProduct,
  PurchaseOrderShipmentPayload,
  ShipmentProductPayload,
  ShipmentProductReceiptPayload
} from '@/types/products/purchase_orders'
import { getMargin, getSellPrice } from '@/utils/business-calculation'

import ShipmentHeaderCard from './ShipmentHeaderCard'
import ShipmentProductCard from './ShipmentProductCard'
import ShipmentTotalsCard from './ShipmentTotalsCard'
import { IncorrectFlags, ProductRowState, ReceiptRowState, ShipmentFormState } from './shipment-arrival.types'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ShipmentArrivalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  purchaseOrderId: string
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

const buildEmptyReceipt = (
  defaultWarehouseType: 'warehouse' | 'location',
  defaultWarehouseId: string
): ReceiptRowState => ({
  id: null,
  received_quantity: 0,
  received_date: new Date(),
  warehouse_type: defaultWarehouseType,
  warehouse_id: defaultWarehouseId,
  stock_area_id: '',
  stock_section_id: '',
  dye_lot: '',
  is_moved_to_inventory: false
})

const mapProductToState = (
  pp: PurchaseOrderProduct,
  defaultWarehouseType: 'warehouse' | 'location',
  defaultWarehouseId: string
): ProductRowState => {
  const receipts: ReceiptRowState[] = pp.purchase_product_receipts?.length
    ? pp.purchase_product_receipts.map(r => ({
        id: r.id,
        received_quantity: r.received_quantity,
        received_date: r.received_date ? new Date(r.received_date) : new Date(),
        warehouse_type: r.warehouse_type,
        warehouse_id: r.warehouse_id,
        stock_area_id: r.stock_area_id ?? '',
        stock_section_id: r.stock_section_id ?? '',
        dye_lot: r.dye_lot ?? '',
        is_moved_to_inventory: r.is_moved_to_inventory
      }))
    : []

  return {
    id: pp.id,
    product_name:
      pp.product?.vendor_product_name || pp.product?.private_product_name || pp.product?.name || 'Unknown Product',
    ordered_quantity: pp.quantity,
    coverage_per_rate: pp.product?.coverage_per_rate ?? null,
    coverage_unit_name: pp.product?.coverage_unit?.name ?? pp.product?.coverage_uom?.name ?? '',
    company_cost: pp.purchase_cost,
    work_order_cost: pp.work_order_cost,
    customer_price: pp.customer_price,
    margin: pp.margin,
    product_selling_price: pp.product?.selling_price ?? 0,
    purchase_unit_name: pp.product?.purchase_unit?.name ?? pp.product?.purchase_uom?.name ?? '',
    selling_unit_name: pp.product?.selling_unit?.name ?? pp.product?.selling_uom?.name ?? '',
    default_warehouse_type: defaultWarehouseType,
    default_warehouse_id: defaultWarehouseId,
    receipts
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ShipmentArrivalModal = ({
  open,
  onOpenChange,
  onSuccess,
  purchaseOrderId,
  warehouses,
  businessLocations
}: ShipmentArrivalModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittingAs, setSubmittingAs] = useState<'received' | 'moved_to_inventory' | null>(null)
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null)

  const [form, setForm] = useState<ShipmentFormState>({
    actual_departure_date: null,
    actual_arrival_date: null,
    actual_shipping_cost: '',
    comments: '',
    tax_amount: '',
    other_costs: ''
  })

  const [incorrectFlags, setIncorrectFlags] = useState<IncorrectFlags>({
    departure: false,
    arrival: false,
    shipping: false
  })

  const [products, setProducts] = useState<ProductRowState[]>([])

  // ─── Load PO on open ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!open || !purchaseOrderId) return

    setIsLoading(true)
    PurchaseOrderService.show(purchaseOrderId)
      .then(response => {
        const po = response.data as PurchaseOrder

        setPurchaseOrder(po)

        setIncorrectFlags({
          departure: po.actual_departure_date != null,
          arrival: po.actual_arrival_date != null,
          shipping: po.actual_shipping_cost != null && po.est_shipping_cost !== po.actual_shipping_cost
        })

        setForm({
          actual_departure_date: po.actual_departure_date ? new Date(po.actual_departure_date) : null,
          actual_arrival_date: po.actual_arrival_date ? new Date(po.actual_arrival_date) : null,
          actual_shipping_cost: po.actual_shipping_cost != null ? String(po.actual_shipping_cost) : '',
          comments: po.comments ?? '',
          tax_amount: (po as any).tax_amount != null ? String((po as any).tax_amount) : '',
          other_costs: (po as any).other_costs != null ? String((po as any).other_costs) : ''
        })

        const defaultWarehouseType = po.warehouse_type ?? 'warehouse'
        const defaultWarehouseId = po.warehouse_id ?? ''

        setProducts(
          (po.purchase_products ?? []).map(pp => mapProductToState(pp, defaultWarehouseType, defaultWarehouseId))
        )
      })
      .catch(() => toast.error('Failed to load purchase order details'))
      .finally(() => setIsLoading(false))
  }, [open, purchaseOrderId])

  const toggleIncorrect = (flag: keyof IncorrectFlags) => {
    setIncorrectFlags(prev => ({ ...prev, [flag]: !prev[flag] }))
  }

  // ─── Computed values ───────────────────────────────────────────────────────

  const totalProductCost = products.reduce((sum, p) => sum + p.company_cost * p.ordered_quantity, 0)

  const shippingCost = incorrectFlags.shipping
    ? Number(form.actual_shipping_cost) || 0
    : (purchaseOrder?.est_shipping_cost ?? 0)

  const taxAmount = Number(form.tax_amount) || 0
  const otherCosts = Number(form.other_costs) || 0
  const actualFinalCost = totalProductCost + shippingCost + taxAmount + otherCosts

  // ─── Form field helpers ────────────────────────────────────────────────────

  const setFormField = <K extends keyof ShipmentFormState>(key: K, value: ShipmentFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // ─── Product field helpers ─────────────────────────────────────────────────

  const updateProduct = (productId: string, updates: Partial<ProductRowState>) => {
    setProducts(prev => prev.map(p => (p.id === productId ? { ...p, ...updates } : p)))
  }

  const handleCompanyCostChange = (productId: string, value: number) => {
    const p = products.find(x => x.id === productId)

    if (!p) return
    updateProduct(productId, { company_cost: value })
  }

  const handleWorkOrderCostChange = (productId: string, value: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p
        const newCustomerPrice = getSellPrice(value, p.margin)

        return { ...p, work_order_cost: value, customer_price: newCustomerPrice }
      })
    )
  }

  const handleCustomerPriceChange = (productId: string, value: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p
        const newMargin = getMargin(p.work_order_cost, value)

        return { ...p, customer_price: value, margin: newMargin }
      })
    )
  }

  const handleMarginChange = (productId: string, value: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== productId) return p
        const newCustomerPrice = getSellPrice(p.work_order_cost, value)

        return { ...p, margin: value, customer_price: newCustomerPrice }
      })
    )
  }

  // ─── Receipt helpers ───────────────────────────────────────────────────────

  const addReceipt = (productId: string) => {
    const p = products.find(x => x.id === productId)

    if (!p) return
    const defaultWarehouseType = p.default_warehouse_type
    const defaultWarehouseId = p.default_warehouse_id
    const alreadyReceived = p.receipts.reduce((sum, r) => sum + (r.received_quantity || 0), 0)
    const remaining = Math.max(0, p.ordered_quantity - alreadyReceived)

    setProducts(prev =>
      prev.map(x =>
        x.id === productId
          ? {
              ...x,
              receipts: [
                ...x.receipts,
                { ...buildEmptyReceipt(defaultWarehouseType, defaultWarehouseId), received_quantity: remaining }
              ]
            }
          : x
      )
    )
  }

  const removeReceipt = (productId: string, receiptIndex: number) => {
    setProducts(prev =>
      prev.map(x => (x.id === productId ? { ...x, receipts: x.receipts.filter((_, i) => i !== receiptIndex) } : x))
    )
  }

  const updateReceipt = (productId: string, receiptIndex: number, updates: Partial<ReceiptRowState>) => {
    setProducts(prev =>
      prev.map(x => {
        if (x.id !== productId) return x
        const updatedReceipts = x.receipts.map((r, i) => (i === receiptIndex ? { ...r, ...updates } : r))

        return { ...x, receipts: updatedReceipts }
      })
    )
  }

  const getTotalReceived = (p: ProductRowState) => p.receipts.reduce((sum, r) => sum + (r.received_quantity || 0), 0)

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (status: 'received' | 'moved_to_inventory') => {
    // Validate receipt quantities
    for (const p of products) {
      const total = getTotalReceived(p)

      if (total > p.ordered_quantity) {
        toast.error(
          `Total received quantity (${total}) for "${p.product_name}" exceeds the ordered quantity (${p.ordered_quantity}).`
        )

        return
      }
    }

    const purchase_products: ShipmentProductPayload[] = products.map(p => {
      const purchase_product_receipts: ShipmentProductReceiptPayload[] = p.receipts
        .filter(r => r.received_quantity > 0)
        .map(r => ({
          id: r.id,
          quantity: r.received_quantity,
          received_date: r.received_date ? format(r.received_date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          warehouse_type: r.warehouse_type,
          warehouse_id: r.warehouse_id,
          stock_area_id: r.stock_area_id || null,
          stock_section_id: r.stock_section_id || null,
          dye_lot: r.dye_lot || null
        }))

      return {
        id: p.id,
        company_cost: p.company_cost,
        work_order_cost: p.work_order_cost,
        customer_price: p.customer_price,
        margin: p.margin,
        purchase_product_receipts
      }
    })

    const payload: PurchaseOrderShipmentPayload = {
      actual_departure_date:
        incorrectFlags.departure && form.actual_departure_date
          ? format(form.actual_departure_date, 'yyyy-MM-dd')
          : null,
      actual_arrival_date:
        incorrectFlags.arrival && form.actual_arrival_date ? format(form.actual_arrival_date, 'yyyy-MM-dd') : null,
      actual_shipping_cost:
        incorrectFlags.shipping && form.actual_shipping_cost !== '' ? Number(form.actual_shipping_cost) : null,
      comments: form.comments || null,
      tax_amount: form.tax_amount !== '' ? Number(form.tax_amount) : null,
      other_costs: form.other_costs !== '' ? Number(form.other_costs) : null,
      purchase_products,
      status
    }

    setIsSubmitting(true)
    setSubmittingAs(status)

    try {
      await PurchaseOrderService.shipment(purchaseOrderId, payload)
      toast.success(
        status === 'received'
          ? 'Purchase order marked as received.'
          : 'Purchase order marked as received & moved to inventory.'
      )
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      if (error?.errors && typeof error.errors === 'object') {
        Object.values(error.errors).forEach((msgs: any) => {
          if (Array.isArray(msgs)) msgs.forEach((m: string) => toast.error(m))
        })
      } else {
        toast.error(error?.message || 'Failed to process shipment arrival')
      }
    } finally {
      setIsSubmitting(false)
      setSubmittingAs(null)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='View Shipment Arrived Information'
      maxWidth='full'
      isLoading={isLoading || isSubmitting}
      loadingMessage={isSubmitting ? 'Processing...' : 'Loading purchase order...'}
      disableClose={isSubmitting}
      actions={
        <div className='flex items-center justify-between w-full'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className='flex gap-3'>
            <Button type='button' variant='outline' onClick={() => handleSubmit('received')} disabled={isSubmitting}>
              {submittingAs === 'received' ? 'Processing...' : 'Mark Received'}
            </Button>
            <Button type='button' onClick={() => handleSubmit('moved_to_inventory')} disabled={isSubmitting}>
              {submittingAs === 'moved_to_inventory' ? 'Processing...' : 'Mark Received & Move to Inventory'}
            </Button>
          </div>
        </div>
      }
    >
      <div className='space-y-6 pb-2'>
        <ShipmentHeaderCard
          purchaseOrder={purchaseOrder}
          form={form}
          incorrectFlags={incorrectFlags}
          onFormChange={setFormField}
          onToggleIncorrect={toggleIncorrect}
        />

        {products.map(p => (
          <ShipmentProductCard
            key={p.id}
            product={p}
            warehouses={warehouses}
            businessLocations={businessLocations}
            onCompanyCostChange={handleCompanyCostChange}
            onWorkOrderCostChange={handleWorkOrderCostChange}
            onCustomerPriceChange={handleCustomerPriceChange}
            onMarginChange={handleMarginChange}
            onAddReceipt={addReceipt}
            onRemoveReceipt={removeReceipt}
            onUpdateReceipt={updateReceipt}
          />
        ))}

        <ShipmentTotalsCard
          totalProductCost={totalProductCost}
          shippingCost={shippingCost}
          taxAmount={form.tax_amount}
          otherCosts={form.other_costs}
          actualFinalCost={actualFinalCost}
          onTaxChange={v => setFormField('tax_amount', v)}
          onOtherCostsChange={v => setFormField('other_costs', v)}
        />
      </div>
    </CommonDialog>
  )
}

export default ShipmentArrivalModal
