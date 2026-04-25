'use client'

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Invoice } from '@/types'
import { formatDate } from '@/utils/date'

// ─── Agreement Sections ──────────────────────────────────────────────────────
const AGREEMENT_SECTIONS = [
  {
    title: 'Before Installation',
    items: [
      'We must have water, electricity, and a climate-controlled (between 65-75 degrees) condition. This is to ensure proper installation and performance of your product.'
    ]
  },
  {
    title: 'During Installation',
    items: [
      'Please keep all pets out of the work area(s) during the project.',
      'Should the installers encounter excessive pet waste (eg., urine-infested carpet, etc.), the customer will be given the option to remedy the waste on their own. If not, our removal is subject to a $250 fee.',
      'We will move the furniture listed in our quote. Please remove all small furniture, lamps, small chairs, small tables, and all breakables from the work area. Remove all china from china cabinets. We do not move any type of fish tanks, breakable, antique, or heirloom pieces. Lower racks of closets must be cleared. We move furniture as a courtesy to our customers. We assume no responsibility for damages due to our movement of your furniture. There will be additional charges to move pianos, pool tables, appliances, or any large pieces of furniture that are not listed on your quote that are still in the work area. While we may move items, such as pool tables, that need balancing, it is your responsibility to have these items properly balanced afterward. Customers are responsible for plugging and unplugging all electronic devices, network cables, computers, etc. Our installers may refuse to move furniture items if there is any chance of damage that might result during moving.',
      'The customer is responsible for turning all water and gas appliances off. We may do this at no responsibility. Existing commodes will be removed and a new wax ring will be installed. We are not responsible for any water leaks or any plumbing problems. We encourage you to hire a plumber to avoid any plumbing problems.',
      'If the thickness of your new flooring requires cutting/shaving of doors to allow for closing, this will be an extra charge of $25 per door. Hollow-core doors may not be able to be cut.'
    ]
  },
  {
    title: 'Door Frames & Moldings (Including Quarter Round and Baseboard)',
    items: [
      'While we will always do our best to avoid any damage, wall paint, sheetrock, wallpaper, baseboards, and moldings may have scratches from carpet installation and installer tools. The customer is responsible for any touch-ups.',
      'We are not responsible for any door frame repair caused by the removal of the existing floor.'
    ]
  },
  {
    title: 'Subfloor',
    items: [
      'If the subfloor is unlevel, it may be necessary to repair the old floor or to install a new subfloor, especially when click vinyl planks are being installed. This work would be at an additional cost. There is a charge for removing the old material and for any unforeseen problems that arise after the removal of the existing floor. If the floor needs to be prepped in order to make it level, there will be an extra charge of $75 per bag (materials and labor), as needed, and cannot be limited to a certain number of bags. If the customer chooses not to level the floors, he/she must agree to accept the risk and there will be no warranties on material and/or installation.'
    ]
  },
  {
    title: 'Carpet',
    items: [
      'Seams are necessary for most carpet installations. While we do our best to hide them, there is no such thing as an invisible seam. Carpet roll crush occurs while the carpet is still on a roll and gradually fades.',
      'Carpet manufacturers recommend having the carpet cleaned by a professional carpet cleaner as needed or at least once every 18 months. Please refer to the specific warranty requirements of the carpet you have purchased.',
      'We offer a 12-month warranty on carpet stretching.',
      'With loop-type carpet such as berber, vacuum sweepers can have beater bars or other items that could potentially pull a loop and cause a runner. Be sure to use a vacuum sweeper that is suitable for this carpet type.'
    ]
  },
  {
    title: 'Tile',
    items: ['All houses settle over time. Cracks in grout should be expected over time as this movement occurs.']
  },
  {
    title: 'Vinyl Planks',
    items: [
      'Due to varying thicknesses of vinyl planks, there may be a difference between the thickness of your new vinyl planks and your previous flooring. As a result, there may be a need to raise or lower your baseboards and/or to add quarter round. If it is decided to lower your baseboard, there will be an unpainted area between where the baseboard was and your existing paint. The painting, if necessary, will be up to the customer. These issues are not always apparent during our measurements of your job and are subject to an additional charge.'
    ]
  },
  {
    title: 'Baseboards',
    items: [
      'If baseboards are purchased from us, they are installed in a primed condition and will need painted, if desired. This is the responsibility of the customer.'
    ]
  },
  {
    title: 'Installation Warranty',
    items: [
      "Materials are warrantied through the manufacturer and have specific requirements for each material. It is the customer's responsibility to understand the warranty requirements. Crabtree's Carpet is not responsible for any guarantees or warranties made by any salesperson that are not expressly written in this contract.",
      'We offer a 30-day warranty on the quality of installation.'
    ]
  },
  {
    title: 'Dust and Trash Disposal',
    items: [
      'Dust inherently occurs during the construction and installation processes. Dust amount will vary from job to job and we are not responsible for cleaning it upon completion.'
    ]
  },
  {
    title: 'Payments',
    items: [
      'We require a 50% deposit. For special-order products, deposits are NOT refundable once materials have been ordered.',
      'Final payments are due upon completion of installation. The installer is trusted and authorized to accept any final payment.',
      "There will be a $50 charge for all returned checks. All additional expenses incurred by collecting unpaid invoices will be at the customer's expense, including, but not limited to, attorney's fees.",
      'We accept cash, check, and credit/debit card payments for deposits and remaining balances.'
    ]
  },
  {
    title: 'Shortages and Add-Ons',
    items: [
      'If the customer provided the initial measurements, then the customer is responsible to pay for any shortages or additional material, including labor and return trip charges.',
      'If the customer decides to add an additional area after signing the original contract, he/she is required to sign a new contract for the added area.'
    ]
  },
  {
    title: 'Circumstances and Delays',
    items: [
      'Due to circumstances beyond our control, installation dates may change. Scheduled installation dates and times are approximate. No discounts will be given due to scheduling conflicts or the length of the job.',
      'Most materials are custom order. While we are provided with an estimated delivery date, the exact delivery date is beyond our control.'
    ]
  },
  {
    title: 'Return & Cancellation Policy',
    items: [
      'Discontinued items, remnants, or clearance items are "All sales final".',
      'All non-stock or special order items are generally not returnable.',
      'We may not accept returns after 30 days from date of purchase.',
      'Returns must be undamaged, in original packing, and in re-sellable condition.',
      'All materials not returned within 15 days are subject to a 35% restocking fee.'
    ]
  },
  {
    title: 'Debt Collection Policy',
    items: [
      'Payment is due as stated on your invoice.',
      'Any unpaid balance will accrue a finance charge of 1.5% per month (18% annually) until fully paid.',
      'If the account is referred to a collection agency or attorney, the customer agrees to pay all related costs, including attorney fees, court filing fees, and collection charges.'
    ]
  }
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  ach: 'ACH',
  'in-store': 'In-Store Payment',
  card: 'Card',
  check: 'Check'
}

// ─── Styles ──────────────────────────────────────────────────────────────────
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

  // Layout
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between' },

  // Divider
  divider: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginVertical: 10 },

  // Section headings
  sectionHeading: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 10
  },

  // Typography baseline
  label: { color: '#555555', fontSize: 9 },
  bold: { fontFamily: 'Helvetica-Bold' },
  small: { fontSize: 8, color: '#555555' },

  // Invoice meta (top-right)
  invoiceTitle: { fontSize: 20, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 4 },
  invoiceMeta: { fontSize: 9, textAlign: 'right', color: '#333333', lineHeight: 1.5 },

  // Company info (top-left)
  companyInfo: { fontSize: 9, color: '#333333', lineHeight: 1.5 },

  // Billing info
  infoBlock: { flex: 1, fontSize: 9, lineHeight: 1.5 },
  infoTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 6 },

  // Items table
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 5,
    paddingHorizontal: 6
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  tableServiceRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  tableHeaderText: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
  tableText: { fontSize: 9, color: '#333333' },
  colItem: { flex: 2 },
  colDesc: { flex: 4 },
  colAmount: { flex: 1, textAlign: 'right' },

  // Totals
  totalsBox: {
    backgroundColor: '#f3f4f6',
    padding: 10,
    width: 200,
    alignSelf: 'flex-end',
    marginTop: 8
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  totalDivider: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginVertical: 4 },
  totalLabel: { fontSize: 9, color: '#555555' },
  totalValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111111' },
  grandTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  grandTotalValue: { fontSize: 10, fontFamily: 'Helvetica-Bold' },

  // Customer agreement
  agreementTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 8 },
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', marginBottom: 3, marginTop: 6 },
  bulletRow: { flexDirection: 'row', marginBottom: 2, paddingLeft: 4, breakInside: 'avoid' },
  bulletDot: { width: 12, fontSize: 9, color: '#555555' },
  bulletText: { flex: 1, fontSize: 8, color: '#444444', lineHeight: 1.4 },

  // Payment
  paymentLabel: { fontSize: 9, color: '#555555', marginBottom: 2 },
  paymentValue: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  fieldRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  fieldLabel: { fontSize: 9, color: '#444444', marginRight: 4, flexShrink: 0 },
  fieldValue: {
    flex: 1,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#aaaaaa',
    paddingBottom: 2,
    color: '#111111'
  },
  fieldValueEmpty: {
    flex: 1,
    fontSize: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 2,
    color: '#111111',
    minWidth: 80
  },

  // Checkbox
  checkboxOuter: {
    width: 11,
    height: 11,
    borderWidth: 1.5,
    borderColor: '#555555',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
  },
  checkboxInner: {
    width: 6,
    height: 6,
    backgroundColor: '#3ecf6d',
    borderRadius: 1
  },

  // Signature
  signatureBox: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 4,
    marginTop: 8,
    width: 216,
    height: 84
  },
  signatureImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6
  },
  footerText: {
    fontSize: 8,
    color: '#888888'
  }
})

// ─── Sub-components ───────────────────────────────────────────────────────────
const Divider = () => <View style={s.divider} />

const FieldEntry = ({ label, value }: { label: string; value: string }) => (
  <View style={s.fieldRow}>
    <Text style={s.fieldLabel}>{label}:</Text>
    <Text style={value ? s.fieldValue : s.fieldValueEmpty}>{value || ' '}</Text>
  </View>
)

// ─── Main Document ────────────────────────────────────────────────────────────
export interface InvoicePDFDocumentProps {
  invoice: Invoice
  logoDataUrl: string | null
  signatureDataUrl: string | null
  isAgreed: boolean
  paymentMethod: string | null
  paymentFieldEntries: { label: string; value: string }[]
}

const InvoicePDFDocument = ({
  invoice,
  logoDataUrl,
  signatureDataUrl,
  isAgreed,
  paymentMethod,
  paymentFieldEntries
}: InvoicePDFDocumentProps) => {
  const clientName = [invoice?.client?.first_name, invoice?.client?.last_name].filter(Boolean).join(' ')

  const clientAddress = [
    invoice?.client?.address?.street_address,
    invoice?.client?.address?.city?.name,
    invoice?.client?.address?.state?.name,
    invoice?.client?.address?.zip_code
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Document>
      <Page size='A4' style={s.page}>
        {/* ── LOGO ── */}
        {logoDataUrl && (
          <View style={{ marginBottom: 12 }}>
            <Image src={logoDataUrl} style={{ width: 120, height: 51 }} />
          </View>
        )}

        {/* ── BASIC INFO: company left, invoice meta right ── */}
        <View style={[s.spaceBetween, { marginBottom: 10, alignItems: 'flex-start' }]}>
          <View style={s.companyInfo}>
            {invoice?.estimate?.assign_user?.userable?.address && (
              <Text>{invoice.estimate.assign_user.userable.address}</Text>
            )}
            {invoice?.estimate?.assign_user?.email && <Text>Email: {invoice.estimate.assign_user.email}</Text>}
            {invoice?.estimate?.assign_user?.userable?.phone && (
              <Text>Phone: {invoice.estimate.assign_user.userable.phone}</Text>
            )}
          </View>
          <View>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceMeta}>Invoice #{String(invoice?.invoice_number ?? '').padStart(6, '0')}</Text>
            {invoice?.issue_date && (
              <Text style={s.invoiceMeta}>Issue Date: {formatDate(new Date(invoice.issue_date))}</Text>
            )}
            {invoice?.due_date && <Text style={s.invoiceMeta}>Due Date: {formatDate(new Date(invoice.due_date))}</Text>}
          </View>
        </View>

        <Divider />

        {/* ── BILLING INFORMATION ── */}
        <View style={[s.spaceBetween, { marginBottom: 12, alignItems: 'flex-start' }]}>
          {/* Customer Information */}
          <View style={s.infoBlock}>
            <Text style={s.infoTitle}>Customer Information</Text>
            {invoice?.client?.company?.name && <Text style={s.companyInfo}>{invoice.client.company.name}</Text>}
            <Text style={s.companyInfo}>{clientName}</Text>
            {clientAddress && <Text style={s.companyInfo}>{clientAddress}</Text>}
            {invoice?.client?.email && <Text style={s.companyInfo}>{invoice.client.email}</Text>}
            {invoice?.client?.phone && <Text style={s.companyInfo}>{invoice.client.phone}</Text>}
          </View>
          {/* Service Site */}
          <View style={[s.infoBlock, { alignItems: 'flex-end' }]}>
            <Text style={[s.infoTitle, { textAlign: 'right' }]}>Service Site</Text>
            {invoice?.estimate?.location && (
              <Text style={[s.companyInfo, { textAlign: 'right' }]}>{invoice.estimate.location}</Text>
            )}
            {invoice?.client?.email && (
              <Text style={[s.companyInfo, { textAlign: 'right' }]}>{invoice.client.email}</Text>
            )}
            {invoice?.client?.phone && (
              <Text style={[s.companyInfo, { textAlign: 'right' }]}>{invoice.client.phone}</Text>
            )}
          </View>
        </View>

        {/* ── ITEMS TABLE ── */}
        {/* Table header */}
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderText, s.colItem]}>Item</Text>
          <Text style={[s.tableHeaderText, s.colDesc]}>Description</Text>
          <Text style={[s.tableHeaderText, s.colAmount]}>Amount</Text>
        </View>

        {/* Table body */}
        {invoice?.services?.map((service, si) => (
          <View key={si}>
            {/* Service type group header */}
            <View style={s.tableServiceRow}>
              <Text style={[s.tableHeaderText, { flex: 1, fontSize: 9 }]}>{service?.service_type?.name ?? ''}</Text>
            </View>
            {/* Items */}
            {service?.items?.map((item, ii) => (
              <View key={`${si}-${ii}`} style={s.tableRow}>
                <Text style={[s.tableText, s.colItem]}>{item?.name ?? ''}</Text>
                <Text style={[s.tableText, s.colDesc]}>{item?.description ?? ''}</Text>
                <Text style={[s.tableText, s.colAmount]}>${item?.total_price ?? ''}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* ── TOTALS ── */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>${invoice?.subtotal}</Text>
          </View>
          {(invoice?.discount ?? 0) > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Discount</Text>
              <Text style={s.totalValue}>-${invoice.discount}</Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tax ({invoice?.tax_rate ?? 0}%)</Text>
            <Text style={s.totalValue}>${invoice?.sale_tax}</Text>
          </View>
          <View style={s.totalDivider} />
          <View style={s.totalRow}>
            <Text style={s.grandTotalLabel}>Total</Text>
            <Text style={s.grandTotalValue}>${invoice?.total}</Text>
          </View>
        </View>

        <Divider />

        {/* ── CUSTOMER AGREEMENT ── */}
        <Text style={s.agreementTitle}>Customer Agreement</Text>
        {AGREEMENT_SECTIONS.map((section, i) => (
          <View key={i}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            {section.items.map((item, j) => (
              <View key={j} style={s.bulletRow} wrap={false}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <Divider />

        {/* ── PAYMENT METHOD ── */}
        <Text style={s.sectionHeading}>Payment Method</Text>

        {/* Method checkboxes row */}
        <View style={[s.row, { flexWrap: 'wrap', marginBottom: 10, gap: 20 }]}>
          {(['ach', 'in-store', 'card', 'check'] as const).map(m => (
            <View key={m} style={[s.row, { alignItems: 'center' }]}>
              {/* Drawn checkbox */}
              <View style={s.checkboxOuter}>{paymentMethod === m && <View style={s.checkboxInner} />}</View>
              <Text style={{ fontSize: 9, color: '#111111' }}>{PAYMENT_METHOD_LABELS[m]}</Text>
            </View>
          ))}
        </View>

        {/* Field entries */}
        {paymentFieldEntries.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {paymentFieldEntries.map((entry, i) => (
              <View key={i} style={{ minWidth: '40%', flex: 1 }}>
                <FieldEntry label={entry.label} value={entry.value} />
              </View>
            ))}
          </View>
        )}

        <Divider />

        {/* ── SIGNATURE ── */}
        <Text style={[s.sectionHeading, { marginBottom: 10 }]}>Signature</Text>

        {/* Agreement checkbox */}
        <View style={[s.row, { alignItems: 'center', marginBottom: 12 }]}>
          <View style={s.checkboxOuter}>{isAgreed && <View style={s.checkboxInner} />}</View>
          <Text style={{ fontSize: 9, color: '#111111' }}>
            I have read and agree to the terms in the customer agreement.
          </Text>
        </View>

        {signatureDataUrl ? (
          <View style={s.signatureBox}>
            <Image src={signatureDataUrl} style={s.signatureImage} />
          </View>
        ) : (
          <View style={[s.signatureBox, { justifyContent: 'flex-end' }]}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#999999', marginHorizontal: 4 }} />
          </View>
        )}
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.4)', width: 216, marginTop: 2 }} />
        <Text style={[s.small, { marginTop: 4 }]}>Customer Signature</Text>

        {/* ── FOOTER: page numbers ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Invoice #{String(invoice?.invoice_number ?? '').padStart(6, '0')}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDFDocument
