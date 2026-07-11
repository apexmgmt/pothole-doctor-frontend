import { Metadata } from 'next'
import { hasPermission } from '@/utils/role-permission'
import LocationService from '@/services/api/locations/location.service'
import StateService from '@/services/api/locations/state.service'
import { CountryWithStates, DataTableApiResponse, State } from '@/types'
import States from '@/views/erp/locations/states/States'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Pothole Doctors'

export const metadata: Metadata = {
  title: `Manage States | ${APP_NAME}`,
  description: `Manage your ${APP_NAME} states.`
}

const StatesPage = async ({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const resolvedSearchParams = await searchParams

  let countriesWithStateAndCities: CountryWithStates[] = []
  let responseData: DataTableApiResponse<State> | null = null

  try {
    const [locationResponse, stateResponse] = await Promise.all([
      LocationService.index(),
      StateService.index(resolvedSearchParams as Record<string, string>)
    ])

    countriesWithStateAndCities = locationResponse?.data || []
    responseData = stateResponse?.data || null
  } catch (error) {
    console.error('Failed to fetch data:', error)
  }

  const [canCreateState, canViewState, canEditState, canDeleteState] = await Promise.all([
    hasPermission('Create State'),
    hasPermission('View State'),
    hasPermission('Update State'),
    hasPermission('Delete State')
  ])

  return (
    <States
      countriesWithStateAndCities={countriesWithStateAndCities}
      initialData={responseData}
      permissions={{ canCreateState, canViewState, canEditState, canDeleteState }}
    />
  )
}

export default StatesPage
