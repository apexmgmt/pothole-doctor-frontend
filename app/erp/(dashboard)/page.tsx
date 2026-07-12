import DashboardIndex from '@/views/erp/dashboard'
import DashboardService from '@/services/api/dashboard.service'
import { isTenant } from '@/utils/utility'

export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
  let data = null
  let tenantMode = false
  let error = null

  try {
    tenantMode = await isTenant()
    const response = await DashboardService.get()

    data = response?.data ?? response
  } catch (err: any) {
    const msg = String(err?.message ?? '')

    if (!msg.toLowerCase().includes('authentication')) {
      error = msg || 'Failed to load dashboard'
    }
  }

  return <DashboardIndex initialData={data} initialTenantMode={tenantMode} error={error} />
}

export default DashboardPage
