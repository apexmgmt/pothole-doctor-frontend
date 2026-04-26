'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { format } from 'date-fns'

import type { BusinessLocation, Warehouse } from '@/types'
import type { PurchaseOrder } from '@/types/products/purchase_orders'
import { formatDate } from '@/utils/date'

import type { IncorrectFlags, ProductRowState, ShipmentFormState } from './shipment-arrival.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShipmentPDFDocumentProps {
  purchaseOrder: PurchaseOrder
  form: ShipmentFormState
  incorrectFlags: IncorrectFlags
  products: ProductRowState[]
  totalProductCost: number
  shippingCost: number
  taxAmount: number
  otherCosts: number
  actualFinalCost: number
  warehouses: Warehouse[]
  businessLocations: BusinessLocation[]
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#111111',
    backgroundColor: '#ffffff'
  },
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 8 },
  sectionHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 6
  },
  productHeading: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 3,
    marginTop: 8
  },
  label: { color: '#555555', fontSize: 8 },
  value: { fontSize: 9, color: '#111111' },
  bold: { fontFamily: 'Helvetica-Bold' },
  titleLarge: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoField: { flex: 1, flexDirection: 'row' },
  infoLabel: { fontSize: 8, color: '#555555', width: 90, flexShrink: 0 },
  infoValue: { flex: 1, fontSize: 9, color: '#111111' },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 3,
    paddingHorizontal: 4
  },
  tableHeaderText: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tableText: { fontSize: 8, color: '#333333' },
  totalsBox: {
    width: 210,
    alignSelf: 'flex-end',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 8
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  totalLabel: { fontSize: 8, color: '#555555' },
  totalValue: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  totalDivider: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginVertical: 4 },
  grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' }
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const displayDate = (value: Date | string | null | undefined): string => {
  if (!value) return '—'
  if (value instanceof Date) return isNaN(value.getTime()) ? '—' : format(value, 'MM/dd/yyyy')

  return formatDate(value) ?? '—'
}

// ─── Component ────────────────────────────────────────────────────────────────

const ShipmentPDFDocument = ({
  purchaseOrder: po,
  form,
  incorrectFlags,
  products,
  totalProductCost,
  shippingCost,
  taxAmount,
  otherCosts,
  actualFinalCost,
  warehouses,
  businessLocations
}: ShipmentPDFDocumentProps) => {
  const getWarehouseName = (type: 'warehouse' | 'location', id: string) => {
    if (!id) return '—'
    if (type === 'warehouse') return warehouses.find(w => w.id === id)?.title ?? '—'

    return businessLocations.find(bl => bl.id === id)?.name ?? '—'
  }

  const vendorName = po.vendor ? `${po.vendor.first_name ?? ''} ${po.vendor.last_name ?? ''}`.trim() || '—' : '—'

  const carrierName = (po.courier as any)?.name ?? '—'

  const locationName =
    po.warehouse_type === 'warehouse' ? ((po.warehouse as any)?.title ?? '—') : ((po.warehouse as any)?.name ?? '—')

  const actualDeparture = incorrectFlags.departure ? displayDate(form.actual_departure_date) : null
  const actualArrival = incorrectFlags.arrival ? displayDate(form.actual_arrival_date) : null

  const actualShipping =
    incorrectFlags.shipping && form.actual_shipping_cost !== ''
      ? `$${Number(form.actual_shipping_cost).toFixed(2)}`
      : null

  return (
    <Document>
      <Page style={s.page}>
        {/* ── Title ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View>
            <Text style={s.titleLarge}>Shipment Details</Text>
            <Text style={[s.label, { marginTop: 2 }]}>
              PO-{po.purchase_order_number?.toString().padStart(6, '0') ?? '—'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[s.label, { marginBottom: 2 }]}>Status</Text>
            <Text style={[s.value, s.bold]}>{po.status?.replace(/_/g, ' ')?.toUpperCase() ?? '—'}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── PO Information ── */}
        <Text style={s.sectionHeading}>Purchase Order Information</Text>
        <View style={s.infoRow}>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>PO #</Text>
            <Text style={s.infoValue}>PO-{po.purchase_order_number?.toString().padStart(6, '0') ?? '—'}</Text>
          </View>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Reference Number</Text>
            <Text style={s.infoValue}>{po.reference_number ?? '—'}</Text>
          </View>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Carrier</Text>
            <Text style={s.infoValue}>{carrierName}</Text>
          </View>
        </View>
        <View style={[s.infoRow, { marginBottom: 10 }]}>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Vendor</Text>
            <Text style={s.infoValue}>{vendorName}</Text>
          </View>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Location</Text>
            <Text style={s.infoValue}>{locationName}</Text>
          </View>
          <View style={s.infoField}>
            <Text style={s.infoLabel}>Lot Number</Text>
            <Text style={s.infoValue}>{po.lot_number ?? '—'}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Shipment Dates & Costs ── */}
        <Text style={s.sectionHeading}>Shipment Dates & Costs</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, marginRight: 20 }}>
            <Text style={[s.label, { marginBottom: 4, fontFamily: 'Helvetica-Bold' }]}>Estimated</Text>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Departure</Text>
              <Text style={s.infoValue}>{displayDate(po.est_departure_date)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Arrival</Text>
              <Text style={s.infoValue}>{displayDate(po.est_arrival_date)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Shipping Cost</Text>
              <Text style={s.infoValue}>
                {po.est_shipping_cost != null ? `$${Number(po.est_shipping_cost).toFixed(2)}` : '—'}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.label, { marginBottom: 4, fontFamily: 'Helvetica-Bold' }]}>Actual</Text>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Departure</Text>
              <Text style={s.infoValue}>{actualDeparture ?? '—'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Arrival</Text>
              <Text style={s.infoValue}>{actualArrival ?? '—'}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { width: 100 }]}>Shipping Cost</Text>
              <Text style={s.infoValue}>{actualShipping ?? '—'}</Text>
            </View>
          </View>
        </View>
        {form.comments ? (
          <View style={{ marginTop: 4 }}>
            <Text style={s.label}>Comments:</Text>
            <Text style={[s.value, { marginTop: 2 }]}>{form.comments}</Text>
          </View>
        ) : null}

        <View style={s.divider} />

        {/* ── Products ── */}
        <Text style={s.sectionHeading}>Products</Text>
        {products.map((p, pIdx) => (
          <View key={pIdx}>
            <Text style={s.productHeading}>{p.product_name}</Text>

            {/* Product costs row */}
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderText, { flex: 1 }]}>Ordered Qty</Text>
              <Text style={[s.tableHeaderText, { flex: 1.5 }]}>Coverage</Text>
              <Text style={[s.tableHeaderText, { flex: 1.5 }]}>Company Cost</Text>
              <Text style={[s.tableHeaderText, { flex: 1.5 }]}>WO Cost</Text>
              <Text style={[s.tableHeaderText, { flex: 1.5 }]}>Customer Price</Text>
              <Text style={[s.tableHeaderText, { flex: 1 }]}>Margin</Text>
            </View>
            <View style={[s.tableRow, { backgroundColor: '#fafafa' }]}>
              <Text style={[s.tableText, { flex: 1 }]}>{p.ordered_quantity}</Text>
              <Text style={[s.tableText, { flex: 1.5 }]}>
                {p.coverage_per_rate != null
                  ? `${(p.ordered_quantity * p.coverage_per_rate).toFixed(2)} ${p.coverage_unit_name}`
                  : '—'}
              </Text>
              <Text style={[s.tableText, { flex: 1.5 }]}>
                ${Number(p.company_cost).toFixed(2)}/{p.purchase_unit_name}
              </Text>
              <Text style={[s.tableText, { flex: 1.5 }]}>
                ${Number(p.work_order_cost).toFixed(2)}/{p.purchase_unit_name}
              </Text>
              <Text style={[s.tableText, { flex: 1.5 }]}>
                ${Number(p.customer_price).toFixed(2)}/{p.selling_unit_name}
              </Text>
              <Text style={[s.tableText, { flex: 1 }]}>{Number(p.margin).toFixed(2)}%</Text>
            </View>

            {/* Receipts */}
            {p.receipts.length > 0 ? (
              <View style={{ marginTop: 6 }}>
                <Text style={[s.label, { marginBottom: 3, paddingLeft: 4 }]}>Receiving Information</Text>
                <View style={s.tableHeaderRow}>
                  <Text style={[s.tableHeaderText, { flex: 1 }]}>Received Qty</Text>
                  <Text style={[s.tableHeaderText, { flex: 1.5 }]}>Date</Text>
                  <Text style={[s.tableHeaderText, { flex: 1 }]}>Type</Text>
                  <Text style={[s.tableHeaderText, { flex: 2 }]}>Warehouse / Location</Text>
                  <Text style={[s.tableHeaderText, { flex: 1 }]}>Dye Lot</Text>
                  <Text style={[s.tableHeaderText, { flex: 1 }]}>In Inventory</Text>
                </View>
                {p.receipts.map((r, rIdx) => (
                  <View key={rIdx} style={s.tableRow}>
                    <Text style={[s.tableText, { flex: 1 }]}>{r.received_quantity}</Text>
                    <Text style={[s.tableText, { flex: 1.5 }]}>{displayDate(r.received_date)}</Text>
                    <Text style={[s.tableText, { flex: 1 }]}>
                      {r.warehouse_type === 'warehouse' ? 'Warehouse' : 'Location'}
                    </Text>
                    <Text style={[s.tableText, { flex: 2 }]}>{getWarehouseName(r.warehouse_type, r.warehouse_id)}</Text>
                    <Text style={[s.tableText, { flex: 1 }]}>{r.dye_lot || '—'}</Text>
                    <Text style={[s.tableText, { flex: 1 }]}>{r.is_moved_to_inventory ? 'Yes' : 'No'}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[s.label, { paddingLeft: 4, marginTop: 2 }]}>No receipts recorded.</Text>
            )}
          </View>
        ))}

        <View style={s.divider} />

        {/* ── Totals ── */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total Product Cost:</Text>
            <Text style={s.totalValue}>${Number(totalProductCost).toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Shipping Cost:</Text>
            <Text style={s.totalValue}>${Number(shippingCost).toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tax:</Text>
            <Text style={s.totalValue}>${Number(taxAmount).toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Other Costs:</Text>
            <Text style={s.totalValue}>${Number(otherCosts).toFixed(2)}</Text>
          </View>
          <View style={s.totalDivider} />
          <View style={s.totalRow}>
            <Text style={s.grandTotalLabel}>Actual Final Cost:</Text>
            <Text style={s.grandTotalValue}>${Number(actualFinalCost).toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default ShipmentPDFDocument
