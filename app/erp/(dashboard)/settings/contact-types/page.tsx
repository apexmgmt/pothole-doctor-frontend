import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import { PaymentTerm } from '@/types'
import ContactTypes from '@/views/erp/settings/contact-types/ContactTypes'

export default async function ContactTypesPage() {
let payment_terms: PaymentTerm[] = []
try {
    const response = await PaymentTermsService.getAllPaymentTerms()
    payment_terms = response.data || []
} catch (error) {
    payment_terms = []
}
  return <ContactTypes payment_terms={payment_terms} />
}
