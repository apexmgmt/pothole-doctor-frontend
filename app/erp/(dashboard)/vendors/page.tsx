import LocationService from '@/services/api/locations/location.service'
import PaymentTermsService from '@/services/api/settings/payment_terms.service'
import TaxTypeService from '@/services/api/tax_types.service'
import { CountryWithStates, PaymentTerm, TaxType } from '@/types'
import Vendors from '@/views/erp/vendors/Vendors'

export default async function VendorsPage() {
  let taxTypes: TaxType[] = []
  let countriesWithStatesAndCities: CountryWithStates[] = []
  let paymentTerms: PaymentTerm[] = []

  try {
    const response = await TaxTypeService.getAllTaxTypes()
    taxTypes = response.data || []
  } catch (error) {
    taxTypes = []
  }

  try {
    const response = await LocationService.index()
    countriesWithStatesAndCities = response.data || []
  } catch (error) {
    countriesWithStatesAndCities = []
  }

  try {
    const response = await PaymentTermsService.getAllPaymentTerms()
    paymentTerms = response.data || []
  } catch (error) {
    paymentTerms = []
  }

  return <Vendors taxTypes={taxTypes} countriesWithStatesAndCities={countriesWithStatesAndCities} paymentTerms={paymentTerms} />
}
