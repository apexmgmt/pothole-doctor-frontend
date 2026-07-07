import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import CountryService from '@/services/api/locations/country.service'
import { DataTableApiResponse, Country } from '@/types'
import Countries from '@/views/erp/locations/countries/Countries'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Countries | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} countries.`
}

export default async function CountriesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<Country> | null = null

  try {
    const response = await CountryService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch countries:', error)
  }

  const [canCreateCountry, canViewCountry, canEditCountry, canDeleteCountry] = await Promise.all([
    hasPermission('Create Country'),
    hasPermission('View Country'),
    hasPermission('Update Country'),
    hasPermission('Delete Country')
  ])

  return (
    <Countries
      initialData={responseData}
      permissions={{ canCreateCountry, canViewCountry, canEditCountry, canDeleteCountry }}
    />
  )
}
