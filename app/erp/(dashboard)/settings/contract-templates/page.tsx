import ContractTemplates from '@/views/erp/settings/ContractTemplates'
import EstimateTypeService from '@/services/api/settings/estimate_types.service'

export default async function ContractTemplatesPage() {
  let estimateTypes = []

  try {
    const response = await EstimateTypeService.getAll()

    if (response?.data) {
      estimateTypes = response.data
    }
  } catch (error) {
    estimateTypes = []
  }

  return <ContractTemplates estimateTypes={estimateTypes} />
}
