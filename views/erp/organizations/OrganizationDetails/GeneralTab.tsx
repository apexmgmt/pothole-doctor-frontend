import EditButton from '@/components/erp/common/buttons/EditButton'
import { Organization } from '@/types'
import { formatDate } from '@/utils/date'
import { appUrl } from '@/utils/utility'

const GeneralTab = ({ companyData }: { companyData: Organization }) => {
  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-light'>Company Details</h3>
        <EditButton
          title='Edit'
          tooltip='Edit Company Information'
          link={`/erp/companies/${companyData.id}/edit`}
          variant='icon'
          buttonSize='default'
          buttonVariant='ghost'
        />
      </div>

      <div className='space-y-5'>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Name : </label>
            <p className='text-light'>
              {companyData.first_name || ''} {companyData.last_name || ''}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Company : </label>
            <p className='text-light'>{companyData.userable?.company_name || ' - '}</p>
          </div>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Domain : </label>
            <p className='text-light break-all'>{appUrl(companyData.domain?.domain) || ' - '}</p>
          </div>
        </div>
        <div className='grid grid-cols-1 2xl:grid-cols-2 gap-6'>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Email : </label>
            <p className='text-light break-all'>{companyData.email || ' - '}</p>
          </div>
          <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
            <label className='text-xs text-gray uppercase block w-25'>Phone : </label>
            <p className='text-light'>{companyData.userable?.phone || ' - '}</p>
          </div>
        </div>

        <div className='flex min-[480px]:items-center items-start gap-2.5 flex-col min-[480px]:flex-row'>
          <label className='text-xs text-gray uppercase block w-25'>Address : </label>
          <p className='text-light'>{companyData.userable?.address || ' - '}</p>
        </div>
      </div>
    </div>
  )
}

export default GeneralTab
