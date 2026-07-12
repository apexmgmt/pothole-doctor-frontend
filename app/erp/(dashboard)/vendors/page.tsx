import LocationService from '@/services/api/locations/location.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import TaxTypeService from '@/services/api/tax_types.service'
import { CountryWithStates, PaymentTerm, TaxType, Vendor, DataTableApiResponse } from '@/types'
import Vendors from '@/views/erp/vendors/Vendors'
import VendorService from '@/services/api/vendors/vendors.service'
import { hasPermission } from '@/utils/role-permission'
export const dynamic = 'force-dynamic'

export default async function VendorsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  const [taxTypesRes, locationsRes, paymentTermsRes] = await Promise.allSettled([
    TaxTypeService.getAll(),
    LocationService.index(),
    PaymentTermsService.getAllPaymentTerms()
  ])

  let responseData: DataTableApiResponse<Vendor> | null = null

  try {
    const response = await VendorService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch vendors:', error)
  }

  const [canCreateVendor, canViewVendor, canEditVendor, canDeleteVendor] = await Promise.all([
    hasPermission('Create Vendor'),
    hasPermission('View Vendor'),
    hasPermission('Update Vendor'),
    hasPermission('Delete Vendor')
  ])

  const taxTypes: TaxType[] = taxTypesRes.status === 'fulfilled' ? taxTypesRes.value.data || [] : []

  const countriesWithStatesAndCities: CountryWithStates[] =
    locationsRes.status === 'fulfilled' ? locationsRes.value.data || [] : []

  const paymentTerms: PaymentTerm[] = paymentTermsRes.status === 'fulfilled' ? paymentTermsRes.value.data || [] : []

  return (
    <Vendors
      taxTypes={taxTypes}
      countriesWithStatesAndCities={countriesWithStatesAndCities}
      paymentTerms={paymentTerms}
      initialData={responseData}
      permissions={{ canCreateVendor, canViewVendor, canEditVendor, canDeleteVendor }}
    />
  )
}
