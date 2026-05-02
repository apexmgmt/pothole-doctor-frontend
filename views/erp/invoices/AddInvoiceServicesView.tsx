'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, UserIcon } from 'lucide-react'
import { toast } from 'sonner'

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
import InvoiceActionsButton from './InvoiceActionsButton'
import ServiceTypeSection from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ServiceTypeSection'
import AddServiceButton from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/AddServiceButton'
import TotalCalculationCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/TotalCalculationCard'
import ClientDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ClientDetailsCard'
import DiscountDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/DiscountDetailsCard'
import ProfitDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ProfitDetailsCard'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

const AddInvoiceServicesView = ({
  invoice: initialInvoice,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = [],
  invoiceTypes = [],
  clients = [],
  staffs = [],
  paymentTerms = [],
  businessLocations = []
}: {
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
}) => {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isMarkingAsSigned, setIsMarkingAsSigned] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(initialInvoice)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])

  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; groupId: string | null; lines: ProposalServiceItemPayload[] }[]
  >([])

  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [customMessage, setCustomMessage] = useState(initialInvoice?.message || '')

  const taxRate = currentInvoice?.tax_rate ?? 0

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

  // Populate from existing invoice services on mount
  useEffect(() => {
    if (currentInvoice?.services && currentInvoice.services.length > 0) {
      setSelectedServiceType(
        currentInvoice.services.map(service => ({
          id: service.service_type_id,
          name: service.service_type?.name || ''
        }))
      )
      setServiceTypeLineItems(
        currentInvoice.services.map(service => ({
          serviceTypeName: service.service_type?.name || '',
          serviceTypeId: service.service_type_id,
          groupId: service.id,
          lines: (service.items || []).map(item => ({
            item_id: item.id,
            product_id: item.product_id,
            product: item?.product,
            labor_cost_id: item.labor_cost_id,
            name: item.name,
            description: item.description,
            type: item.type,
            unit_cost: item.unit_cost,
            qty: item.qty,
            unit_name: item.unit_name || '',
            unit_id: item.unit_id ?? '',
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
      )
    }

    setHasUnsavedChanges(false)
  }, [])

  const handleAddServiceType = (serviceTypeId: string) => {
    const found = serviceTypes.find(st => st.id === serviceTypeId)

    if (found) {
      setSelectedServiceType(prev => [...prev, { id: found.id, name: found.name }])
      setServiceTypeLineItems(prev => [
        ...prev,
        { serviceTypeName: found.name, serviceTypeId: found.id, groupId: null, lines: [] }
      ])
    }

    setServiceSelectOpen(false)
    setHasUnsavedChanges(true)
  }

  const handleRemoveServiceType = (index: number) => {
    setSelectedServiceType(prev => prev.filter((_, i) => i !== index))
    setServiceTypeLineItems(prev => prev.filter((_, i) => i !== index))
    setHasUnsavedChanges(true)
  }

  const buildPayload = (): InvoiceServicePayload => ({
    estimate_id: currentInvoice.id,
    message: customMessage,
    discount_type: discountType,
    discount: discountValue,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index]?.id || st.serviceTypeId,
      group_id: st.groupId ?? null,
      items: st.lines.map(line => {
        const computedTaxAmount = line.is_sale ? getDiscountedUnitPrice(line) * line.qty * (taxRate / 100) : 0

        return {
          item_id: line.item_id ?? null,
          product_id: line.product_id,
          labor_cost_id: line.labor_cost_id,
          name: line.name,
          description: line.description,
          type: line.type,
          unit_cost: line.unit_cost,
          qty: line.qty,
          unit_name: line.unit_name,
          unit_id: line.unit_id,
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
    setHasUnsavedChanges(true)
    toast.success(`Discount applied: ${type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`}`)
  }

  const saveInvoiceServices = async (showSuccessToast = true) => {
    if (selectedServiceType.length === 0) {
      return
    }

    const hasExistingServices = currentInvoice?.services && currentInvoice.services.length > 0

    if (hasExistingServices) {
      await InvoiceService.updateServices(currentInvoice.id, buildPayload())
    } else {
      await InvoiceService.storeServices(currentInvoice.id, buildPayload())
    }

    setHasUnsavedChanges(false)

    if (showSuccessToast) {
      toast.success('Invoice services saved successfully')
    }
  }

  const onSubmit = async () => {
    if (selectedServiceType.length === 0) {
      toast.error('Please add at least one service type')

      return
    }

    setIsLoading(true)

    try {
      await saveInvoiceServices()

      // router.push('/erp/invoices')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save invoice services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsSigned = async () => {
    setIsMarkingAsSigned(true)

    try {
      if (hasUnsavedChanges) {
        await saveInvoiceServices(false)
      }

      const response = await InvoiceService.markSigned(currentInvoice.id)

      setCurrentInvoice(response.data || { ...currentInvoice, status: 'invoice signed' })
      toast.success('Invoice marked as signed successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to mark invoice as signed')
    } finally {
      setIsMarkingAsSigned(false)
    }
  }

  const handleEmailWithSave = async () => {
    setIsSendingEmail(true)

    try {
      if (selectedServiceType.length > 0) {
        await saveInvoiceServices(false)
      }

      await InvoiceService.sendEmail(currentInvoice.id)
      toast.success('Invoice email sent to customer successfully')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send invoice email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const clientName = [currentInvoice?.client?.first_name, currentInvoice?.client?.last_name].filter(Boolean).join(' ')

  const isEditMode = !!(currentInvoice?.services && currentInvoice.services.length > 0)

  return (
    <div className='space-y-4'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => router.push('/erp/invoices')}
            disabled={isLoading}
          >
            <ChevronLeftIcon className='h-4 w-4 mr-1' />
            Back
          </Button>
          <div>
            <h1 className='text-xl font-bold'>
              Invoice #{currentInvoice?.invoice_number?.toString().padStart(6, '0') || 'N/A'}
            </h1>
            <p className='text-sm text-zinc-400'>{isEditMode ? 'Edit Invoice Services' : 'Add Invoice Services'}</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <p className='text-sm font-semibold text-zinc-200'>
            <UserIcon className='h-4 w-4 inline-block mr-2' />
            {clientName || '—'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
          <InvoiceActionsButton
            invoice={currentInvoice}
            isMarkingAsSigned={isMarkingAsSigned}
            isSendingEmail={isSendingEmail}
            onViewEditDetails={() => setIsInvoiceDetailsOpen(true)}
            onViewWorkOrder={() => {
              if (currentInvoice?.work_order_id) {
                window.open(`/erp/work-orders/${currentInvoice.work_order_id}?mode=view`, '_blank')
              }
            }}
            onMarkAsSigned={handleMarkAsSigned}
            onConfirmedEmailSend={handleEmailWithSave}
          />
          <AddServiceButton
            serviceTypes={serviceTypes}
            selectedServiceTypeIds={selectedServiceType.map(st => st.id)}
            open={serviceSelectOpen}
            onOpenChange={setServiceSelectOpen}
            onSelect={handleAddServiceType}
          />
        </div>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={() => router.push('/erp/invoices')} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditMode ? 'Update Services' : 'Save Services'}
          </Button>
        </div>
      </div>

      {/* Detail Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <ClientDetailsCard estimateDetails={currentInvoice as any} />
        <DiscountDetailsCard
          mode='create'
          estimateDetails={currentInvoice as any}
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

                copy[idx] = {
                  serviceTypeName: item.name,
                  serviceTypeId: item.id,
                  groupId: serviceTypeLineItems[idx]?.groupId ?? null,
                  lines
                }

                return copy
              })
              setHasUnsavedChanges(true)
            }}
            productCategories={productCategories}
            uomUnits={uomUnits}
            vendors={vendors}
            taxRate={taxRate}
          />
        ))}
      </div>

      {/* Custom Message */}
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <label htmlFor='inv-custom-message' className='block text-sm font-medium text-zinc-200 mb-2'>
            Message / Notes
          </label>
          <Textarea
            id='inv-custom-message'
            className='w-full'
            placeholder='Enter a message or notes for this invoice...'
            value={customMessage}
            onChange={e => {
              setCustomMessage(e.target.value)
              setHasUnsavedChanges(true)
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Invoice Details Modal */}
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
        onSuccess={() => setIsInvoiceDetailsOpen(false)}
      />
    </div>
  )
}

export default AddInvoiceServicesView
