import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import OrganizationService from '@/services/api/organizations.service'
import { DataTableApiResponse } from '@/types'
import Organizations from '@/views/erp/organizations/Organizations'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Companies | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} companies.`
}

export default async function OrganizationsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse | null = null

  try {
    // Next.js Server Cache will handle caching and revalidation based on your setup
    const response = await OrganizationService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch companies:', error)
  }

  const [canCreateCompany, canViewCompany, canEditCompany] = await Promise.all([
    hasPermission('Create Company'),
    hasPermission('View Company'),
    hasPermission('Update Company')
  ])

  return <Organizations initialData={responseData} permissions={{ canCreateCompany, canViewCompany, canEditCompany }} />
}
