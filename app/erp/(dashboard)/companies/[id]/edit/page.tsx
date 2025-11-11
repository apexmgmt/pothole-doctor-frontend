import CompanyService from '@/services/api/company.service';
import EditCompany from '@/views/erp/companies/EditCompany'

const EditCompanyPage = async ({ params }: { params: { id: string } }) => {
    const { id } = await params;

    let companyDetails = null;
    const response = await CompanyService.show(id);
    if (response && response.data) {
        companyDetails = response.data;
    }
    
  return <EditCompany companyDetails={companyDetails} />
}

export default EditCompanyPage
