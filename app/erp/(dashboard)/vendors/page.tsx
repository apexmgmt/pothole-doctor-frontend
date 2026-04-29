import LocationService from '@/services/api/locations/location.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import TaxTypeService from '@/services/api/tax_types.service'
import { CountryWithStates, PaymentTerm, TaxType } from '@/types'
import Vendors from '@/views/erp/vendors/Vendors'

export const dynamic = 'force-dynamic'

export default async function VendorsPage() {
  const [taxTypesRes, locationsRes, paymentTermsRes] = await Promise.allSettled([
    TaxTypeService.getAll(),
    LocationService.index(),
    PaymentTermsService.getAllPaymentTerms()
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
    />
  )
}
