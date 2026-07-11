import ContactTypeService from '@/services/api/settings/contact_types.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import { PaymentTerm, ContactType, DataTableApiResponse } from '@/types'
import { hasPermission } from '@/utils/role-permission'
import ContactTypes from '@/views/erp/settings/contact-types/ContactTypes'

export const dynamic = 'force-dynamic'

export default async function ContactTypesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let payment_terms: PaymentTerm[] = []

  try {
    const response = await PaymentTermsService.getAllPaymentTerms()

    payment_terms = response.data || []
  } catch (error) {
    payment_terms = []
  }

  let responseData: DataTableApiResponse<ContactType> | null = null

  try {
    const response = await ContactTypeService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch contact types:', error)
  }

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Contact Type'),
    hasPermission('Update Contact Type'),
    hasPermission('Delete Contact Type')
  ])

  return (
    <ContactTypes
      paymentTerms={payment_terms}
      initialData={responseData}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  )
}
