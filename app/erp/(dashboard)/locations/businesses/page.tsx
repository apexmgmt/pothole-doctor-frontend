import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import { DataTableApiResponse, BusinessLocation } from '@/types'
import BusinessLocations from '@/views/erp/locations/businesses/Businesses'
import BusinessLocationService from '@/services/api/locations/business_location.service'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Business Locations | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} business locations.`
}

const BusinessLocationsPage = async ({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const resolvedSearchParams = await searchParams

  let responseData: DataTableApiResponse<BusinessLocation> | null = null

  try {
    const response = await BusinessLocationService.index(resolvedSearchParams as Record<string, string>)

    responseData = response?.data || null
  } catch (error) {
    console.error('Failed to fetch business locations:', error)
  }

  const [canCreateBusiness, canViewBusiness, canEditBusiness, canDeleteBusiness] = await Promise.all([
    hasPermission('Create Business'),
    hasPermission('View Business'),
    hasPermission('Update Business'),
    hasPermission('Delete Business')
  ])

  return (
    <BusinessLocations
      initialData={responseData}
      permissions={{ canCreateBusiness, canViewBusiness, canEditBusiness, canDeleteBusiness }}
    />
  )
}

export default BusinessLocationsPage
