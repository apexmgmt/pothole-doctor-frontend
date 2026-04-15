import InvoiceService from '@/services/api/invoices/invoices.service'
import { Invoice, InvoiceHistory } from '@/types'
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

    const invoiceNumber = invoice.invoice_number?.toString().padStart(6, '0') ?? ''

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

  try {
    const response = await InvoiceService.viewInvoice(inid, icid)

    invoice = response?.data?.invoice ?? null
    histories = response?.data?.histories ?? []
  } catch (error) {
    console.log('Error fetching invoice details', error)
    invoice = null
    histories = []
  }

  if (!invoice) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h2 className='text-2xl font-semibold mb-4'>Invoice Not Found</h2>
        <p className='text-gray-600'>The invoice you are looking for does not exist or has been deleted.</p>
      </div>
    )
  }

  return <InvoiceView invoice={invoice} inid={inid ?? ''} icid={icid ?? ''} histories={histories} />
}

export default InvoiceDetailsPage
