import CompanyService from '@/services/api/company.service'
import Companies from '@/views/erp/companies/Companies'
import { cookies } from 'next/headers'

const CompaniesPage = async () => {
  // If you need auth token from cookies:
  // const token = cookies().get('token')?.value

  let companiesResponse: object = {}

  try {
    const response = await CompanyService.index()
    companiesResponse = response?.data
    // companiesResponse = await CompanyService.index({ token })
  } catch (error) {
    companiesResponse = {}
  }

  return <Companies companiesResponse={companiesResponse} />
}

export default CompaniesPage
