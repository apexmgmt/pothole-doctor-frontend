'use client'

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Invoice, ContractTemplate } from '@/types'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'

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

// ─── HTML Parser for PDF ─────────────────────────────────────────────────────
const InlineHtmlNode = ({ node }: { node: ChildNode }) => {
  if (node.nodeType === Node.TEXT_NODE) {
    return <>{node.textContent}</>
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    let style: any = {}

    if (tag === 'strong' || tag === 'b') style.fontFamily = 'Helvetica-Bold'
    if (el.style && el.style.color) style.color = el.style.color

    return (
      <Text style={style}>
        {Array.from(node.childNodes).map((c, i) => (
          <InlineHtmlNode key={i} node={c} />
        ))}
      </Text>
    )
  }

  return null
}

const BlockHtmlNode = ({ node }: { node: ChildNode }) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim()

    if (!text) return null

    return <Text>{text}</Text>
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()

    if (tag === 'p') {
      const text = el.textContent?.trim()

      if (!text || text === '') return null // Skip empty paragraphs

      return (
        <View style={{ marginBottom: 4 }}>
          <Text>
            {Array.from(node.childNodes).map((c, i) => (
              <InlineHtmlNode key={i} node={c} />
            ))}
          </Text>
        </View>
      )
    }

    if (tag === 'ul' || tag === 'ol') {
      let itemIndex = 1

      return (
        <View style={{ marginBottom: 6, paddingLeft: 24 }}>
          {Array.from(node.childNodes).map((c, i) => {
            if (c.nodeName.toLowerCase() === 'li') {
              const prefix = tag === 'ul' ? '•' : `${itemIndex++}.`

              return (
                <View key={i} style={s.bulletRow} wrap={false}>
                  <Text style={s.bulletDot}>{prefix}</Text>
                  <Text style={s.bulletText}>
                    {Array.from(c.childNodes).map((cc, ii) => (
                      <InlineHtmlNode key={ii} node={cc} />
                    ))}
                  </Text>
                </View>
              )
            }

            return null
          })}
        </View>
      )
    }

    // Wrap inline elements that got placed at the root level in a block
    if (tag === 'span' || tag === 'strong' || tag === 'b') {
      return (
        <View style={{ marginBottom: 4 }}>
          <Text>
            <InlineHtmlNode node={node} />
          </Text>
        </View>
      )
    }

    // Fallback block
    return (
      <View style={{ marginBottom: 4 }}>
        <Text>
          {Array.from(node.childNodes).map((c, i) => (
            <InlineHtmlNode key={i} node={c} />
          ))}
        </Text>
      </View>
    )
  }

  return null
}

const HtmlParser = ({ html }: { html: string }) => {
  if (typeof window === 'undefined') return null

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  return (
    <View style={{ fontSize: 9, color: '#333333' }}>
      {Array.from(doc.body.childNodes).map((node, i) => (
        <BlockHtmlNode key={i} node={node} />
      ))}
    </View>
  )
}

// ─── Main Document ────────────────────────────────────────────────────────────
export interface InvoicePDFDocumentProps {
  invoice: Invoice
  logoDataUrl: string | null
  signatureDataUrl: string | null
  isAgreed: boolean
  paymentMethod: string | null
  paymentFieldEntries: { label: string; value: string }[]
  contractTemplate?: ContractTemplate | null
}

const InvoicePDFDocument = ({
  invoice,
  logoDataUrl,
  signatureDataUrl,
  isAgreed,
  paymentMethod,
  paymentFieldEntries,
  contractTemplate
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
            {invoice?.assign_user?.userable?.address && <Text>{invoice.assign_user.userable.address}</Text>}
            {invoice?.assign_user?.email && <Text>Email: {invoice.assign_user.email}</Text>}
            {invoice?.assign_user?.userable?.phone && <Text>Phone: {invoice.assign_user.userable.phone}</Text>}
          </View>
          <View>
            <Text style={s.invoiceTitle}>INVOICE</Text>
            <Text style={s.invoiceMeta}>
              Invoice #{invoice?.invoice_number_prefix ? `${invoice.invoice_number_prefix}-` : ''}
              {String(invoice?.invoice_number ?? '')}
            </Text>
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
            {invoice?.address && (
              <Text style={[s.companyInfo, { textAlign: 'right' }]}>
                {invoice.address?.street_address},{invoice.address?.city?.name ? invoice.address.city.name : ''}
                {invoice.address?.state?.name ? ', ' + invoice.address.state.name : ''}
                {invoice.address?.zip_code ? ' ' + invoice.address.zip_code : ''}
              </Text>
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
                <Text style={[s.tableText, s.colAmount]}>{formatCurrency(item?.total_price)}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* ── TOTALS ── */}
        <View style={s.totalsBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Subtotal</Text>
            <Text style={s.totalValue}>{formatCurrency(invoice?.subtotal)}</Text>
          </View>
          {(invoice?.discount ?? 0) > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Discount</Text>
              <Text style={s.totalValue}>-{formatCurrency(invoice?.discount)}</Text>
            </View>
          )}
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tax {invoice?.tax_rate ? `(${invoice?.tax_rate}%)` : ''}</Text>
            <Text style={s.totalValue}>{formatCurrency(invoice?.sale_tax)}</Text>
          </View>
          <View style={s.totalDivider} />
          <View style={s.totalRow}>
            <Text style={s.grandTotalLabel}>Total</Text>
            <Text style={s.grandTotalValue}>{formatCurrency(invoice?.total)}</Text>
          </View>
        </View>

        <Divider />

        {/* ── CUSTOMER AGREEMENT ── */}
        {contractTemplate && contractTemplate.template_message && (
          <View>
            <Text style={s.agreementTitle}>Customer Agreement</Text>
            <HtmlParser html={contractTemplate.template_message} />
            <Divider />
          </View>
        )}

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
          <Text style={s.footerText}>
            Invoice #{invoice?.invoice_number_prefix ? `${invoice.invoice_number_prefix}-` : ''}
            {String(invoice?.invoice_number ?? '')}
          </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export default InvoicePDFDocument
