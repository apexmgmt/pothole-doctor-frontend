import CompanyService from '@/services/api/company.service'
import Companies from '@/views/erp/companies/Companies'
import { cookies } from 'next/headers'

const CompaniesPage = async () => {
  return <Companies />
}

export default CompaniesPage
