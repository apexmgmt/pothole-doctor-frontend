'use client'

import { Separator } from '@/components/ui/separator'
import { Invoice } from '@/types'
import InvoiceActions from './InvoiceActions'
import InvoiceBasicInfo from './InvoiceBasicInfo'
import InvoiceBillingInformation from './InvoiceBillingInformation'
import InvoiceBillingItems from './InvoiceBillingItems'
import InvoiceCustomerAgreement from './InvoiceCustomerAgreement'
import InvoicePaymentMethod from './InvoicePaymentMethod'
import InvoiceSignature from './InvoiceSignature'

const InvoiceView = ({ invoice }: { invoice: Invoice }) => {
  return (
    <>
      {/* Invoice Basic Info */}
      <InvoiceBasicInfo invoice={invoice} />
      <Separator className='mt-4' />
      {/* Billing Information */}
      <InvoiceBillingInformation invoice={invoice} />
      {/* Billing Items */}
      <InvoiceBillingItems invoice={invoice} />
      <Separator className='mb-4' />
      {/* Customer Agreement */}
      <InvoiceCustomerAgreement />
      <Separator className='mb-4' />
      {/* Payment Method */}
      <InvoicePaymentMethod total={invoice.total} />
      <Separator className='mb-4' />
      {/* Signature */}
      <InvoiceSignature />
      <Separator className='mb-4' />
      {/* Invoice Actions */}
      <InvoiceActions invoice={invoice} />
    </>
  )
}

export default InvoiceView
