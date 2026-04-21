import { Invoice } from '@/types'

const InvoiceBillingInformation = ({ invoice }: { invoice: Invoice }) => {
  return (
    <div className='flex flex-col-reverse gap-4 sm:flex-row sm:justify-between mt-4 text-sm text-black'>
      {/* Bill To */}
      <div className='flex flex-col'>
        <h6 className='font-semibold text-base mb-4'>Customer Information</h6>
        {invoice?.client?.company?.name && <p>{invoice.client.company.name}</p>}
        <p>{invoice?.client?.first_name + ' ' + invoice?.client?.last_name}</p>
        <p className='wrap-break-word'>
          {invoice?.client?.address?.street_address}
          {invoice?.client?.address?.city?.name ? ', ' + invoice.client.address.city.name : ''}
          {invoice?.client?.address?.state?.name ? ', ' + invoice.client.address.state.name : ''}
          {invoice?.client?.address?.zip_code ? ' ' + invoice.client.address.zip_code : ''}
        </p>
        <p>{invoice?.client?.email}</p>
        <p>{invoice?.client?.phone}</p>
      </div>
      {/* Service Site */}
      <div className='flex flex-col sm:text-right'>
        <h6 className='font-semibold text-base mb-4'>Service Site</h6>
        <p>
          {invoice?.address?.street_address}
          {invoice?.address?.city?.name ? ', ' + invoice.address.city.name : ''}
          {invoice?.address?.state?.name ? ', ' + invoice.address.state.name : ''}
          {invoice?.address?.zip_code ? ' ' + invoice.address.zip_code : ''}
        </p>
        <p>{invoice?.client?.email}</p>
        <p>{invoice?.client?.phone}</p>
      </div>
    </div>
  )
}

export default InvoiceBillingInformation
