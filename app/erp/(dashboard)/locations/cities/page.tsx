import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import LocationService from '@/services/api/locations/location.service'
import CityService from '@/services/api/locations/city.service'
import { CountryWithStates, DataTableApiResponse, City } from '@/types'
import Cities from '@/views/erp/locations/cities/Cities'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage Cities | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} cities.`
}

const CitiesPage = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const resolvedSearchParams = await searchParams

  let countriesWithStateAndCities: CountryWithStates[] = []
  let responseData: DataTableApiResponse<City> | null = null

  try {
    const [locationResponse, cityResponse] = await Promise.all([
      LocationService.index(),
      CityService.index(resolvedSearchParams as Record<string, string>)
    ])

    countriesWithStateAndCities = locationResponse?.data || []
    responseData = cityResponse?.data || null
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }

  const [canCreateCity, canViewCity, canEditCity, canDeleteCity] = await Promise.all([
    hasPermission('Create City'),
    hasPermission('View City'),
    hasPermission('Update City'),
    hasPermission('Delete City')
  ])

  return (
    <Cities 
      countriesWithStateAndCities={countriesWithStateAndCities} 
      initialData={responseData}
      permissions={{ canCreateCity, canViewCity, canEditCity, canDeleteCity }}
    />
  )
}

export default CitiesPage
