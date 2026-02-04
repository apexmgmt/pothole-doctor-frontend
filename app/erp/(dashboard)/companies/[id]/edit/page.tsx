import OrganizationService from '@/services/api/organizations.service'
import EditOrganization from '@/views/erp/organizations/EditOrganization'

const EditOrganizationPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params

  let companyDetails = null
  const response = await OrganizationService.show(id)

  if (response && response.data) {
    companyDetails = response.data
  }

  return <EditOrganization companyDetails={companyDetails} />
}

export default EditOrganizationPage
