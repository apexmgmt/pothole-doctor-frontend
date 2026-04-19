'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserIcon, ChevronLeftIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  ProductCategory,
  ProposalServiceItemPayload,
  ServiceType,
  Unit,
  Vendor,
  WorkOrder,
  WorkOrderServicePayload,
  EstimateType,
  Client,
  Staff,
  PaymentTerm,
  BusinessLocation
} from '@/types'
import WorkOrderService from '@/services/api/work-orders/work_orders.service'
import EditWorkOrderModal from './EditWorkOrderModal'
import ServiceTypeSection from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ServiceTypeSection'
import AddServiceButton from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/AddServiceButton'
import ClientDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ClientDetailsCard'
import ProfitDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ProfitDetailsCard'
import TotalCalculationCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/TotalCalculationCard'

const EditWorkOrderServicesView = ({
  workOrder: initialWorkOrder,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = [],
  workOrderTypes = [],
  clients = [],
  staffs = [],
  paymentTerms = [],
  businessLocations = []
}: {
  workOrder: WorkOrder
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  workOrderTypes?: EstimateType[]
  clients?: Client[]
  staffs?: Staff[]
  paymentTerms?: PaymentTerm[]
  businessLocations?: BusinessLocation[]
}) => {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isWorkOrderDetailsOpen, setIsWorkOrderDetailsOpen] = useState(false)
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(initialWorkOrder)

  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])

  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; groupId: string | null; lines: ProposalServiceItemPayload[] }[]
  >([])

  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  const taxRate = currentWorkOrder?.tax_rate ?? 0

  const lockedTotal = Number(currentWorkOrder?.total ?? 0)
  const lockedSubtotal = Number(currentWorkOrder?.subtotal ?? 0)
  const lockedSalesTax = Number(currentWorkOrder?.sale_tax ?? 0)

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  const currentCost = allLines.reduce((sum, line) => {
    if (line.type === 'comment') return sum

    return sum + Number(line.unit_cost ?? 0) * Number(line.qty ?? 0)
  }, 0)

  const totalFreight = allLines.reduce((sum, line) => sum + Number(line.freight_charge ?? 0), 0)

  const totalTax = allLines.reduce(
    (sum, line) => sum + Number(line.is_sale ? (Number(line?.tax ?? 0) * Number(line?.total_price ?? 0)) / 100 : 0),
    0
  )

  const profit = lockedTotal - currentCost - totalFreight - totalTax
  const profitPercent = lockedTotal > 0 ? (profit / lockedTotal) * 100 : 0

  const materialLines = allLines.filter(l => l.type === 'product' || l.type === 'invoice' || l.type === 'expense')
  const materialSubtotal = materialLines.reduce((sum, l) => sum + Number(l.unit_cost ?? 0) * Number(l.qty ?? 0), 0)

  const materialTax = materialLines.reduce(
    (sum, l) => sum + (l.is_sale ? Number(l.unit_cost ?? 0) * Number(l.qty ?? 0) * (taxRate / 100) : 0),
    0
  )

  const materialTotal = materialSubtotal + materialTax

  const laborLines = allLines.filter(l => l.type === 'labor')
  const laborSubtotal = laborLines.reduce((sum, l) => sum + Number(l.unit_cost ?? 0) * Number(l.qty ?? 0), 0)

  const laborTax = laborLines.reduce(
    (sum, l) => sum + (l.is_sale ? Number(l.unit_cost ?? 0) * Number(l.qty ?? 0) * (taxRate / 100) : 0),
    0
  )

  const laborTotal = laborSubtotal + laborTax

  // Populate from existing work order services on mount
  useEffect(() => {
    if (currentWorkOrder?.services && currentWorkOrder.services.length > 0) {
      setSelectedServiceType(
        currentWorkOrder.services.map(service => ({
          id: service.service_type_id,
          name: service.service_type?.name || ''
        }))
      )
      setServiceTypeLineItems(
        currentWorkOrder.services.map(service => ({
          serviceTypeName: service.service_type?.name || '',
          serviceTypeId: service.service_type_id,
          groupId: service.id,
          lines: (service.items || []).map(item => ({
            item_id: item.id,
            product_id: item.product_id,
            labor_cost_id: item.labor_cost_id,
            name: item.name,
            description: item.description,
            type: item.type,
            unit_cost: item.unit_cost,
            qty: item.qty,
            unit_name: item.unit_name || '',
            unit_id: item.unit_id ?? '',
            vendor_id: item.vendor_id ?? '',
            product: item.product,
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
            note: item.note || '',
            material_job_actions: item.material_job_actions
          }))
        }))
      )
    }
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
  }

  const handleRemoveServiceType = (index: number) => {
    setSelectedServiceType(prev => prev.filter((_, i) => i !== index))
    setServiceTypeLineItems(prev => prev.filter((_, i) => i !== index))
  }

  const buildPayload = (): WorkOrderServicePayload => ({
    estimate_id: currentWorkOrder.id,
    message: customMessageRef.current?.value || '',
    discount_type: 'percentage',
    discount: 0,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index]?.id || st.serviceTypeId,
      group_id: st.groupId ?? null,
      items: st.lines.map(line => ({
        item_id: line.item_id ?? null,
        product_id: line.product_id,
        vendor_id: line.vendor_id,
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
        tax_amount: 0,
        total_price: line.total_price,
        note: line.note
      }))
    }))
  })

  const onSubmit = async () => {
    if (selectedServiceType.length === 0) {
      toast.error('Please add at least one service type')

      return
    }

    setIsLoading(true)

    try {
      const hasExistingServices = currentWorkOrder?.services && currentWorkOrder.services.length > 0

      if (hasExistingServices) {
        await WorkOrderService.updateServices(currentWorkOrder.id, buildPayload())
      } else {
        await WorkOrderService.storeServices(currentWorkOrder.id, buildPayload())
      }

      toast.success('Work order services updated successfully')
      router.push('/erp/work-orders')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update work order services')
    } finally {
      setIsLoading(false)
    }
  }

  const clientName = [currentWorkOrder?.client?.first_name, currentWorkOrder?.client?.last_name]
    .filter(Boolean)
    .join(' ')

  return (
    <div className='space-y-4'>
      {/* Page Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => router.push('/erp/work-orders')}
            disabled={isLoading}
          >
            <ChevronLeftIcon className='h-4 w-4 mr-1' />
            Back
          </Button>
          <div>
            <h1 className='text-xl font-bold'>
              Work Order #{currentWorkOrder?.work_order_number?.toString().padStart(6, '0') || 'N/A'}
            </h1>
            <p className='text-sm text-zinc-400'>Edit Work Order Services</p>
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
          <Button type='button' variant='outline' onClick={() => setIsWorkOrderDetailsOpen(true)} disabled={isLoading}>
            Work Order Details
          </Button>
          <AddServiceButton
            serviceTypes={serviceTypes}
            selectedServiceTypeIds={selectedServiceType.map(st => st.id)}
            open={serviceSelectOpen}
            onOpenChange={setServiceSelectOpen}
            onSelect={handleAddServiceType}
          />
        </div>
        <div className='flex gap-2'>
          <Button type='button' variant='outline' onClick={() => router.push('/erp/work-orders')} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Update Services'}
          </Button>
        </div>
      </div>

      {/* Detail Cards */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4'>
        <ClientDetailsCard estimateDetails={currentWorkOrder as any} />
        <ProfitDetailsCard profitPercent={profitPercent} profitAmount={profit} totalProfit={profit} />
        <TotalCalculationCard
          title='Material'
          subtotal={materialSubtotal}
          salesTax={materialTax}
          total={materialTotal}
        />
        <TotalCalculationCard title='Labor' subtotal={laborSubtotal} salesTax={laborTax} total={laborTotal} />
        <TotalCalculationCard title='Total' subtotal={lockedSubtotal} salesTax={lockedSalesTax} total={lockedTotal} />
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
            mode='edit'
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
            }}
            productCategories={productCategories}
            uomUnits={uomUnits}
            vendors={vendors}
            taxRate={taxRate}
            hideMargin={true}
            showVendor={true}
            showPurchaseQty={true}
            allowedLineTypes={['product', 'labor', 'expense']}
          />
        ))}
      </div>

      {/* Custom Message */}
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardContent className='p-4'>
          <label htmlFor='wo-custom-message' className='block text-sm font-medium text-zinc-200 mb-2'>
            Message / Notes
          </label>
          <Textarea
            id='wo-custom-message'
            className='w-full'
            placeholder='Enter a message or notes for this work order...'
            ref={customMessageRef}
            defaultValue={currentWorkOrder?.message || ''}
          />
        </CardContent>
      </Card>

      {/* Edit Work Order Details Modal */}
      <EditWorkOrderModal
        open={isWorkOrderDetailsOpen}
        onOpenChange={(open: boolean) => setIsWorkOrderDetailsOpen(open)}
        workOrderId={currentWorkOrder?.id}
        workOrderDetails={currentWorkOrder}
        workOrderTypes={workOrderTypes}
        serviceTypes={serviceTypes}
        clients={clients}
        staffs={staffs}
        paymentTerms={paymentTerms}
        businessLocations={businessLocations}
        onSuccess={() => {
          setIsWorkOrderDetailsOpen(false)
        }}
      />
    </div>
  )
}

export default EditWorkOrderServicesView
