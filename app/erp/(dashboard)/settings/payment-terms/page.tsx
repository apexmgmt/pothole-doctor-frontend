import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import { PaymentTermType } from '@/types'
import PaymentTerms from '@/views/erp/settings/payment-terms/PaymentTerms'

export default async function PaymentTermsPage() {
  let paymentTermTypes: PaymentTermType[] = []

  try {
    const response = await PaymentTermsService.getPaymentTermTypes()
    paymentTermTypes = response.data || []
  } catch (error) {
    paymentTermTypes = []
  }
  return <PaymentTerms paymentTermTypes={paymentTermTypes} />
}
