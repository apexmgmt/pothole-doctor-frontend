import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import BusinessLocations from '@/views/erp/locations/businesses/Businesses'
import BusinessLocationService from '@/services/api/locations/business_location.service'
import LocationService from '@/services/api/locations/location.service'
import { BusinessLocation, DataTableApiResponse } from '@/types'

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

  const [locationRes] = await Promise.allSettled([LocationService.index()])

  const [
    canCreateBusiness,
    canViewBusiness,
    canEditBusiness,
    canDeleteBusiness,
    canManageWarehouse,
    canManageStaff,
    canManageEstimate
  ] = await Promise.all([
    hasPermission('Create Location'),
    hasPermission('View Location'),
    hasPermission('Update Location'),
    hasPermission('Delete Location'),
    hasPermission('Manage Warehouse'),
    hasPermission('Manage Staff'),
    hasPermission('Manage Estimate')
  ])

  const locations = locationRes.status === 'fulfilled' ? locationRes.value.data || [] : []

  return (
    <BusinessLocations
      initialData={responseData}
      locations={locations}
      permissions={{
        canCreateBusiness,
        canViewBusiness,
        canEditBusiness,
        canDeleteBusiness,
        canManageWarehouse,
        canManageStaff,
        canManageEstimate
      }}
    />
  )
}

export default BusinessLocationsPage
