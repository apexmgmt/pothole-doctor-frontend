'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Invoice } from '@/types'
import InvoiceService from '@/services/api/invoices.service'
import InvoiceActions from './InvoiceActions'
import InvoiceBasicInfo from './InvoiceBasicInfo'
import InvoiceBillingInformation from './InvoiceBillingInformation'
import InvoiceBillingItems from './InvoiceBillingItems'
import InvoiceCustomerAgreement from './InvoiceCustomerAgreement'
import InvoicePaymentMethod, { InvoicePaymentMethodHandle } from './InvoicePaymentMethod'
import InvoiceSignature, { InvoiceSignatureHandle } from './InvoiceSignature'

/** Convert any image URL to a PNG data URL via an in-memory canvas. */
const loadImageAsDataUrl = (src: string): Promise<string | null> => {
  return new Promise(resolve => {
    try {
      const img = new window.Image()

      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')

          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          canvas.getContext('2d')!.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch {
          resolve(null)
        }
      }

      img.onerror = () => resolve(null)
      img.src = src
    } catch {
      resolve(null)
    }
  })
}

/** Map internal payment method keys to the backend-expected values. */
const PAYMENT_METHOD_MAP: Record<string, string> = {
  ach: 'ACH',
  'in-store': 'In-Store Payment',
  card: 'Card',
  check: 'Check'
}

const InvoiceView = ({ invoice, inid, icid }: { invoice: Invoice; inid: string; icid: string }) => {
  const [isSigned, setIsSigned] = useState(invoice?.is_signed ?? false)
  const [isAgreed, setIsAgreed] = useState(invoice?.is_signed ?? false)
  const [hasPayment, setHasPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [invoiceStatus, setInvoiceStatus] = useState(invoice.status)

  const signatureRef = useRef<InvoiceSignatureHandle>(null)
  const paymentRef = useRef<InvoicePaymentMethodHandle>(null)

  const canSubmit = isSigned && isAgreed && hasPayment
  const canShowSubmit = invoiceStatus === 'new' || invoiceStatus === 'sent to customer'

  const generatePdfBlob = async (): Promise<Blob> => {
    // ── 1. Collect data from component refs ──────────────────────────────────
    const signatureDataUrl = signatureRef.current?.getSignatureDataUrl() ?? null
    const paymentMethod = paymentRef.current?.getSelectedMethod() ?? null
    const paymentFieldEntries = paymentRef.current?.getFieldEntries() ?? []

    // ── 2. Load logo as a PNG data URL (avoids WebP / CORS issues in react-pdf) ─
    const logoDataUrl = await loadImageAsDataUrl(window.location.origin + '/images/dashboard/logo.webp')

    // ── 3. Dynamically import react-pdf to avoid SSR issues ──────────────────
    const { pdf } = await import('@react-pdf/renderer')
    const { default: InvoicePDFDocument } = await import('./InvoicePDFDocument')

    // ── 4. Generate text-based PDF ────────────────────────────────────────────
    const blob = await pdf(
      <InvoicePDFDocument
        invoice={invoice}
        logoDataUrl={logoDataUrl}
        signatureDataUrl={signatureDataUrl}
        isAgreed={isAgreed}
        paymentMethod={paymentMethod}
        paymentFieldEntries={paymentFieldEntries}
      />
    ).toBlob()

    return blob
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)

    try {
      const paymentMethod = paymentRef.current?.getSelectedMethod() ?? null
      const paymentFieldEntries = paymentRef.current?.getFieldEntries() ?? []

      const pdfBlob = await generatePdfBlob()

      const formData = new FormData()

      formData.append('inid', inid)
      formData.append('icid', icid)
      formData.append('file', pdfBlob, `invoice-${inid}.pdf`)

      // Payment method (mapped to backend enum values)
      if (paymentMethod) {
        formData.append('payment_method', PAYMENT_METHOD_MAP[paymentMethod] ?? paymentMethod)
      }

      // Payment method data as key→value array entries
      paymentFieldEntries.forEach(({ label, value }) => {
        formData.append(`payment_method_data[${label}]`, value)
      })

      // Agreement checkbox
      formData.append('is_agreed_terms', isAgreed ? '1' : '0')

      const result = await InvoiceService.approveInvoice(inid, formData)

      if (result?.data?.invoice?.status) {
        setInvoiceStatus(result.data.invoice.status)
      }

      toast.success('Invoice submitted successfully!')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to submit invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div>
        {/* Invoice Basic Info */}
        <InvoiceBasicInfo invoice={invoice} />
        <Separator className='mt-4 bg-[#e5e7eb]' />
        {/* Billing Information */}
        <InvoiceBillingInformation invoice={invoice} />
        {/* Billing Items */}
        <InvoiceBillingItems invoice={invoice} />
        <Separator className='mb-4 bg-[#e5e7eb]' />
        {/* Customer Agreement */}
        <InvoiceCustomerAgreement />
        <Separator className='mb-4 bg-[#e5e7eb]' />
        {/* Payment Method */}
        <InvoicePaymentMethod
          ref={paymentRef}
          total={invoice.total}
          onMethodChange={m => setHasPayment(!!m)}
          readOnly={!canShowSubmit}
          initialMethod={invoice.payment_method ?? null}
          initialData={invoice.payment_method_data ?? null}
        />
        <Separator className='mb-4 bg-[#e5e7eb]' />
        {/* Signature */}
        <InvoiceSignature
          ref={signatureRef}
          onSignedChange={setIsSigned}
          onAgreedChange={setIsAgreed}
          readOnly={!canShowSubmit}
          initialAgreed={!!invoice?.is_signed}
        />
      </div>
      <Separator className='mb-4' />
      <div>
        <InvoiceActions
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          showSubmit={canShowSubmit}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default InvoiceView
