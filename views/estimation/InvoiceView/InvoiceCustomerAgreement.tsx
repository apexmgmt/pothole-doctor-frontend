import { ContractTemplate } from '@/types'
import { Separator } from '@radix-ui/react-separator'

const InvoiceCustomerAgreement = ({ contractTemplate }: { contractTemplate?: ContractTemplate | null }) => {
  if (!contractTemplate || !contractTemplate.template_message) return null

  return (
    <>
      <div className='my-6 text-sm text-black'>
        <h3 className='text-lg font-semibold mb-4'>Customer Agreement</h3>
        <div
          className='[&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-10 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-10 [&_li]:mt-1 [&_p]:mt-2 first:[&_p]:mt-0 text-[rgba(0,0,0,0.8)]'
          dangerouslySetInnerHTML={{ __html: contractTemplate.template_message }}
        />
      </div>
      <Separator className='mb-4 bg-[#e5e7eb]' />
    </>
  )
}

export default InvoiceCustomerAgreement
