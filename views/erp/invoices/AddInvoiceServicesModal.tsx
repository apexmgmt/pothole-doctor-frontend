'use client'

import { useEffect, useRef, useState } from 'react'
import { UserIcon } from 'lucide-react'
import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  BusinessLocation,
  Client,
  EstimateType,
  Invoice,
  InvoiceServicePayload,
  PaymentTerm,
  ProductCategory,
  ProposalServiceItemPayload,
  ServiceType,
  Staff,
  Unit,
  Vendor
} from '@/types'
import CreateOrEditInvoiceModal from './CreateOrEditInvoiceModal'
import InvoiceService from '@/services/api/invoices/invoices.service'
import ServiceTypeSection from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ServiceTypeSection'
import AddServiceButton from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/AddServiceButton'
import TotalCalculationCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/TotalCalculationCard'
import ClientDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ClientDetailsCard'
import DiscountDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/DiscountDetailsCard'
import ProfitDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ProfitDetailsCard'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

const AddInvoiceServicesModal = ({
  open,
  onOpenChange,
  invoice,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = [],
  invoiceTypes = [],
  clients = [],
  staffs = [],
  paymentTerms = [],
  businessLocations = [],
  onSuccess
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  invoiceTypes?: EstimateType[]
  clients?: Client[]
  staffs?: Staff[]
  paymentTerms?: PaymentTerm[]
  businessLocations?: BusinessLocation[]
  onSuccess?: () => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(invoice)

  // Keep currentInvoice in sync if the prop changes (e.g. after an edit)
  useEffect(() => {
    setCurrentInvoice(invoice)
  }, [invoice])

  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)

  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])

  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; lines: ProposalServiceItemPayload[] }[]
  >([])

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  const taxRate = invoice?.tax_rate ?? 0

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  const totalSales = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') return sum - (line.total_price ?? 0)
    const unitPrice = getDiscountedUnitPrice(line)

    return sum + unitPrice * line.qty
  }, 0)

  const profitAmount = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') return sum - (line.total_price ?? 0)
    const unitPrice = getDiscountedUnitPrice(line)

    return sum + (unitPrice - line.unit_cost) * line.qty - (line.freight_charge ?? 0)
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

  const salesTax = allLines
    .filter(line => line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      if (line.type === 'deduction') return sum - unitPrice * line.qty * (taxRate / 100)

      return sum + unitPrice * line.qty * (taxRate / 100)
    }, 0)

  const total = totalSales + salesTax

  const totalDiscount = allLines.reduce((sum, line) => {
    if (line.type === 'comment' || line.type === 'deduction') return sum

    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discountedUnitPrice = getDiscountedUnitPrice(line)

    return sum + (baseUnitPrice - discountedUnitPrice) * line.qty
  }, 0)

  const handleAddServiceType = (serviceTypeId: string) => {
    const found = serviceTypes.find(st => st.id === serviceTypeId)

    if (found) {
      setSelectedServiceType(prev => [...prev, { id: found.id, name: found.name }])
    }

    setServiceSelectOpen(false)
  }

  const handleRemoveServiceType = (index: number) => {
    setSelectedServiceType(prev => prev.filter((_, i) => i !== index))
    setServiceTypeLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const buildPayload = (): InvoiceServicePayload => ({
    estimate_id: invoice.id,
    message: customMessageRef.current?.value || '',
    discount_type: discountType,
    discount: discountValue,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index]?.id || st.serviceTypeId,
      items: st.lines.map(line => {
        const computedTaxAmount = line.is_sale ? getDiscountedUnitPrice(line) * line.qty * (taxRate / 100) : 0

        return {
          product_id: line.product_id,
          labor_cost_id: line.labor_cost_id,
          name: line.name,
          description: line.description,
          type: line.type,
          unit_cost: line.unit_cost,
          qty: line.qty,
          unit_name: line.unit_name,
          total_cost: line.total_cost,
          margin: line.margin,
          unit_price: line.unit_price,
          discount: line.discount,
          discount_type: line.discount_type,
          freight_charge: line.freight_charge,
          is_sale: line.is_sale,
          tax_type: line.tax_type,
          tax: taxRate,
          tax_amount: computedTaxAmount,
          total_price: line.total_price,
          note: line.note
        }
      })
    }))
  })

  const handleApplyDiscount = (type: 'percentage' | 'fixed', value: number) => {
    const allProductAndLaborLines = serviceTypeLineItems.flatMap(st =>
      st.lines.filter(line => line.type === 'product' || line.type === 'labor')
    )

    if (type === 'fixed') {
      const grandBaseTotal = allProductAndLaborLines.reduce((sum, line) => {
        const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

        return sum + baseUnitPrice * line.qty
      }, 0)

      if (value > grandBaseTotal) {
        toast.error(
          `Fixed discount ($${value.toFixed(2)}) cannot exceed the grand total ($${grandBaseTotal.toFixed(2)})`
        )

        return
      }

      // Proportional fixed discount: (line_base_total / grand_base_total) * total_discount
      setServiceTypeLineItems(prev =>
        prev.map(st => ({
          ...st,
          lines: st.lines.map(line => {
            if (line.type !== 'product' && line.type !== 'labor') return line

            const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
            const lineBaseTotal = baseUnitPrice * line.qty
            const proportionalDiscount = grandBaseTotal > 0 ? (lineBaseTotal / grandBaseTotal) * value : 0

            return { ...line, discount: proportionalDiscount, discount_type: 'fixed' as const }
          })
        }))
      )
    } else {
      // Percentage: same rate on every applicable line
      setServiceTypeLineItems(prev =>
        prev.map(st => ({
          ...st,
          lines: st.lines.map(line =>
            line.type === 'product' || line.type === 'labor'
              ? { ...line, discount: value, discount_type: 'percentage' as const }
              : line
          )
        }))
      )
    }

    setDiscountType(type)
    setDiscountValue(value)
    toast.success(`Discount applied: ${type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`}`)
  }

  const resetForm = () => {
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setServiceSelectOpen(false)
    setDiscountType('percentage')
    setDiscountValue(0)
  }

  const onSubmit = async () => {
    if (selectedServiceType.length === 0) {
      toast.error('Please add at least one service type')

      return
    }

    setIsLoading(true)

    try {
      const hasExistingServices = invoice?.services && invoice.services.length > 0

      if (hasExistingServices) {
        await InvoiceService.updateServices(invoice.id, buildPayload())
      } else {
        await InvoiceService.storeServices(invoice.id, buildPayload())
      }

      toast.success('Invoice services saved successfully')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save invoice services')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    resetForm()
    onOpenChange(false)
    onSuccess?.()
  }

  // Populate from existing invoice services when editing
  useEffect(() => {
    if (open && invoice?.services && invoice.services.length > 0) {
      const newSelectedServiceType = invoice.services.map(service => ({
        id: service.service_type_id,
        name: service.service_type?.name || ''
      }))

      setSelectedServiceType(newSelectedServiceType)

      const newServiceTypeLineItems = invoice.services.map(service => ({
        serviceTypeName: service.service_type?.name || '',
        serviceTypeId: service.service_type_id,
        lines: (service.items || []).map(item => ({
          product_id: item.product_id,
          labor_cost_id: item.labor_cost_id,
          name: item.name,
          description: item.description,
          type: item.type,
          unit_cost: item.unit_cost,
          qty: item.qty,
          unit_name: item.unit_name || '',
          total_cost: item.total_cost,
          margin: item.margin,
          unit_price: item.unit_price,
          discount: item.discount,
          discount_type: item.discount_type,
          freight_charge: item.freight_charge,
          is_sale: item.is_sale,
          tax_type: item.tax_type,
          tax: item.tax,
          tax_amount: item.tax_amount,
          total_price: item.total_price,
          note: item.note || ''
        }))
      }))

      setServiceTypeLineItems(newServiceTypeLineItems)
    }
  }, [open, invoice])

  const clientName = [invoice?.client?.first_name, invoice?.client?.last_name].filter(Boolean).join(' ')

  const isEditMode = !!(invoice?.services && invoice.services.length > 0)

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Saving invoice services...'
      open={open}
      onOpenChange={onCancel}
      title={isEditMode ? 'Edit Invoice Services' : 'Add Invoice Services'}
      description={isEditMode ? 'Update service line items for this invoice' : 'Add service line items to this invoice'}
      maxWidth='full'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            {isEditMode ? 'Cancel' : 'Cancel'}
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Services' : 'Save Services'}
          </Button>
        </div>
      }
    >
      <>
        {/* Header */}
        <div className='flex justify-between mb-4'>
          <div className='flex gap-4 items-center'>
            <p className='text-lg font-bold'>
              Invoice #{invoice?.invoice_number?.toString().padStart(6, '0') || 'N/A'}
            </p>
            <p className='text-sm font-semibold text-zinc-200'>
              <span>
                <UserIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              {clientName || '—'}
            </p>
          </div>
          <div className='flex gap-2'>
            <Button type='button' variant='outline' size='default' onClick={() => setIsInvoiceDetailsOpen(true)}>
              View/Edit Invoice Details
            </Button>
            <AddServiceButton
              serviceTypes={serviceTypes}
              open={serviceSelectOpen}
              onOpenChange={setServiceSelectOpen}
              onSelect={handleAddServiceType}
            />
          </div>
        </div>

        {/* Detail Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
          <ClientDetailsCard estimateDetails={invoice as any} />
          <DiscountDetailsCard
            mode='create'
            estimateDetails={invoice as any}
            discountType={discountType}
            discountValue={discountValue}
            totalDiscount={totalDiscount}
            onApplyDiscount={handleApplyDiscount}
          />
          <ProfitDetailsCard profitPercent={profitPercent} profitAmount={profitAmount} totalProfit={profitAmount} />
          <TotalCalculationCard subtotal={totalSales} salesTax={salesTax} total={total} />
        </div>

        {/* Service Type Sections */}
        <div className='space-y-4'>
          {selectedServiceType.length === 0 && (
            <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md border border-zinc-700 border-dashed'>
              <p className='text-zinc-400 text-sm'>
                No services added yet. Click <strong>Add Service</strong> to get started.
              </p>
            </div>
          )}
          {selectedServiceType.map((item, idx) => (
            <ServiceTypeSection
              key={idx}
              mode='create'
              serviceTypeName={item.name}
              serviceTypeId={item.id}
              onRemove={() => handleRemoveServiceType(idx)}
              serviceTypes={serviceTypes}
              units={units}
              lines={serviceTypeLineItems[idx]?.lines || []}
              onLinesChange={lines => {
                setServiceTypeLineItems(prev => {
                  const copy = [...prev]

                  copy[idx] = { serviceTypeName: item.name, serviceTypeId: item.id, lines }

                  return copy
                })
              }}
              productCategories={productCategories}
              uomUnits={uomUnits}
              vendors={vendors}
              taxRate={taxRate}
            />
          ))}
        </div>

        {/* Custom Message */}
        <Card className='bg-zinc-900 border-zinc-800 mt-4'>
          <CardContent className='p-4'>
            <label htmlFor='inv-custom-message' className='block text-sm font-medium text-zinc-200 mb-2'>
              Message / Notes
            </label>
            <Textarea
              id='inv-custom-message'
              className='w-full'
              placeholder='Enter a message or notes for this invoice...'
              ref={customMessageRef}
              defaultValue={invoice?.message || ''}
            />
          </CardContent>
        </Card>
      </>
      <CreateOrEditInvoiceModal
        mode='edit'
        open={isInvoiceDetailsOpen}
        onOpenChange={open => setIsInvoiceDetailsOpen(open)}
        invoiceId={currentInvoice?.id}
        invoiceDetails={currentInvoice}
        invoiceTypes={invoiceTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        onSuccess={() => {
          setIsInvoiceDetailsOpen(false)
          onSuccess?.()
        }}
      />
    </CommonDialog>
  )
}

export default AddInvoiceServicesModal
