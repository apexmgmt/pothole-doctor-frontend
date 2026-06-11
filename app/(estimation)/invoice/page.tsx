import InvoiceService from '@/services/api/invoices/invoices.service'
import ContractTemplateService from '@/services/api/settings/contract_templates.service'
import { Invoice, InvoiceHistory, ContractTemplate } from '@/types'
import InvoiceView from '@/views/estimation/InvoiceView'
import { Metadata } from 'next'
export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ searchParams }: { searchParams: any }): Promise<Metadata> => {
  const { inid, icid } = await searchParams

  try {
    const response = await InvoiceService.viewInvoice(inid, icid)
    const invoice: Invoice | null = response?.data?.invoice ?? null

    if (!invoice) {
      return { title: 'Invoice Not Found' }
    }

    const invoiceNumber =
      (invoice?.invoice_number_prefix ? `${invoice.invoice_number_prefix}-` : '') +
      (invoice?.invoice_number?.toString() ?? '')

    const clientName = [invoice.client?.first_name, invoice.client?.last_name].filter(Boolean).join(' ')

    const title = `Invoice #${invoiceNumber}${clientName ? ` — ${clientName}` : ''} (Pothole Doctor)`

    const description = invoice.message
      ? invoice.message.slice(0, 160)
      : `Review invoice #${invoiceNumber} from Pothole Doctor.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website'
      }
    }
  } catch {
    return { title: 'Invoice' }
  }
}

const InvoiceDetailsPage = async ({ searchParams }: { searchParams: any }) => {
  const { inid, icid } = await searchParams
  let invoice: Invoice | null = null
  let histories: InvoiceHistory[] = []
  let contractTemplates: ContractTemplate[] = []

  const [invoiceResult, templatesResult] = await Promise.allSettled([
    InvoiceService.viewInvoice(inid, icid),
    ContractTemplateService.getAll()
  ])

  if (invoiceResult.status === 'fulfilled') {
    invoice = invoiceResult.value?.data?.invoice ?? null
    histories = invoiceResult.value?.data?.histories ?? []
  } else {
    console.log('Error fetching invoice details', invoiceResult.reason)
  }

  if (templatesResult.status === 'fulfilled') {
    contractTemplates = templatesResult.value?.data || []
  } else {
    console.log('Error fetching contract templates', templatesResult.reason)
  }

  if (!invoice) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Invoice Not Found</h2>
        <p className='text-gray-600'>The invoice you are looking for does not exist or has been deleted.</p>
      </div>
    )
  }

  return <InvoiceView invoice={invoice} inid={inid ?? ''} icid={icid ?? ''} histories={histories} contractTemplates={contractTemplates} />
}

export default InvoiceDetailsPage
