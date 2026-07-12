import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import { PaymentTermType, DataTableApiResponse, PaymentTerm } from '@/types'
import PaymentTerms from '@/views/erp/settings/payment-terms/PaymentTerms'
import { hasPermission } from '@/utils/role-permission'

export const dynamic = 'force-dynamic'

export default async function PaymentTermsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams
  let paymentTermTypes: PaymentTermType[] = []

  try {
    const response = await PaymentTermsService.getPaymentTermTypes()

    paymentTermTypes = response.data || []
  } catch (error) {
    paymentTermTypes = []
  }

  let responseData: DataTableApiResponse<PaymentTerm> | null = null

  try {
    const response = await PaymentTermsService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch payment terms:', error)
  }

  const [canCreate, canEdit, canDelete] = await Promise.all([
    hasPermission('Create Payment Term'),
    hasPermission('Update Payment Term'),
    hasPermission('Delete Payment Term')
  ])

  return (
    <PaymentTerms
      paymentTermTypes={paymentTermTypes}
      initialData={responseData}
      permissions={{ canCreate, canEdit, canDelete }}
    />
  )
}
