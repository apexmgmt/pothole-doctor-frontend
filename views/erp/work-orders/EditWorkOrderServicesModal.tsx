'use client'

import { useEffect, useRef, useState } from 'react'
import { UserIcon, ChevronDownIcon } from 'lucide-react'
import { toast } from 'sonner'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import ServiceTypeSection from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ServiceTypeSection'
import AddServiceButton from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/AddServiceButton'
import ClientDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ClientDetailsCard'
import ProfitDetailsCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/ProfitDetailsCard'
import TotalCalculationCard from '@/views/erp/estimates/EstimateDetails/CreateOrEditProposalModal/TotalCalculationCard'

const EditWorkOrderServicesModal = ({
  open,
  onOpenChange,
  workOrder,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = [],
  workOrderTypes = [],
  clients = [],
  staffs = [],
  paymentTerms = [],
  businessLocations = [],
  onSuccess
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  onSuccess?: () => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isWorkOrderDetailsOpen, setIsWorkOrderDetailsOpen] = useState(false)
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(workOrder)

  // Keep currentWorkOrder in sync when the prop changes
  useEffect(() => {
    setCurrentWorkOrder(workOrder)
  }, [workOrder])

  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)

  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])

  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; lines: ProposalServiceItemPayload[] }[]
  >([])

  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  const taxRate = workOrder?.tax_rate ?? 0

  // Locked values from the work order (never change)
  const lockedTotal = Number(workOrder?.total ?? 0)
  const lockedSubtotal = Number(workOrder?.subtotal ?? 0)
  const lockedSalesTax = Number(workOrder?.sale_tax ?? 0)

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  // Cost-based profit: locked total minus raw execution costs
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

  // Material lines (product / invoice / expense types)
  const materialLines = allLines.filter(l => l.type === 'product' || l.type === 'invoice' || l.type === 'expense')
  const materialSubtotal = materialLines.reduce((sum, l) => sum + Number(l.unit_cost ?? 0) * Number(l.qty ?? 0), 0)

  const materialTax = materialLines.reduce(
    (sum, l) => sum + (l.is_sale ? Number(l.unit_cost ?? 0) * Number(l.qty ?? 0) * (taxRate / 100) : 0),
    0
  )

  const materialTotal = materialSubtotal + materialTax

  // Labor lines
  const laborLines = allLines.filter(l => l.type === 'labor')
  const laborSubtotal = laborLines.reduce((sum, l) => sum + Number(l.unit_cost ?? 0) * Number(l.qty ?? 0), 0)

  const laborTax = laborLines.reduce(
    (sum, l) => sum + (l.is_sale ? Number(l.unit_cost ?? 0) * Number(l.qty ?? 0) * (taxRate / 100) : 0),
    0
  )

  const laborTotal = laborSubtotal + laborTax

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

  const buildPayload = (): WorkOrderServicePayload => ({
    estimate_id: workOrder.id,
    message: customMessageRef.current?.value || '',
    discount_type: 'percentage',
    discount: 0,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index]?.id || st.serviceTypeId,
      items: st.lines.map(line => ({
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
        tax_amount: 0,
        total_price: line.total_price,
        note: line.note
      }))
    }))
  })

  const resetForm = () => {
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setServiceSelectOpen(false)
  }

  const onSubmit = async () => {
    if (selectedServiceType.length === 0) {
      toast.error('Please add at least one service type')

      return
    }

    setIsLoading(true)

    try {
      const hasExistingServices = workOrder?.services && workOrder.services.length > 0

      if (hasExistingServices) {
        await WorkOrderService.updateServices(workOrder.id, buildPayload())
      } else {
        await WorkOrderService.storeServices(workOrder.id, buildPayload())
      }

      toast.success('Work order services updated successfully')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update work order services')
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    resetForm()
    onOpenChange(false)
    onSuccess?.()
  }

  // Populate from existing work order services
  useEffect(() => {
    if (open && workOrder?.services && workOrder.services.length > 0) {
      const newSelectedServiceType = workOrder.services.map(service => ({
        id: service.service_type_id,
        name: service.service_type?.name || ''
      }))

      setSelectedServiceType(newSelectedServiceType)

      const newServiceTypeLineItems = workOrder.services.map(service => ({
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
  }, [open, workOrder])

  const clientName = [workOrder?.client?.first_name, workOrder?.client?.last_name].filter(Boolean).join(' ')

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Updating work order services...'
      open={open}
      onOpenChange={onCancel}
      title='Edit Work Order Services'
      description='Update service line items — total is locked, changes affect profit only'
      maxWidth='full'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='button' onClick={onSubmit} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Saving...' : 'Update Services'}
          </Button>
        </div>
      }
    >
      <>
        {/* Header */}
        <div className='flex justify-between mb-4'>
          <div className='flex gap-4 items-center'>
            <p className='text-lg font-bold'>
              Work Order #{workOrder?.work_order_number?.toString().padStart(6, '0') || 'N/A'}
            </p>
            <p className='text-sm font-semibold text-zinc-200'>
              <UserIcon className='h-4 w-4 inline-block mr-2' />
              {clientName || '—'}
            </p>
          </div>
          <div className='flex gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type='button' variant='outline' size='default'>
                  Work Order Actions
                  <ChevronDownIcon className='h-4 w-4 ml-2' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setIsWorkOrderDetailsOpen(true)}>
                  View/Edit Work Order Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AddServiceButton
              serviceTypes={serviceTypes}
              open={serviceSelectOpen}
              onOpenChange={setServiceSelectOpen}
              onSelect={handleAddServiceType}
            />
          </div>
        </div>

        {/* Detail Cards */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4 mb-4'>
          <ClientDetailsCard estimateDetails={workOrder as any} />
          <ProfitDetailsCard profitPercent={profitPercent} profitAmount={profit} totalProfit={profit} />
          {/* Material breakdown */}
          <TotalCalculationCard
            title='Material'
            subtotal={materialSubtotal}
            salesTax={materialTax}
            total={materialTotal}
          />
          {/* Labor breakdown */}
          <TotalCalculationCard title='Labor' subtotal={laborSubtotal} salesTax={laborTax} total={laborTotal} />
          {/* Locked customer-facing totals */}
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

                  copy[idx] = { serviceTypeName: item.name, serviceTypeId: item.id, lines }

                  return copy
                })
              }}
              productCategories={productCategories}
              uomUnits={uomUnits}
              vendors={vendors}
              taxRate={taxRate}
              hideMargin={true}
            />
          ))}
        </div>

        {/* Custom Message */}
        <Card className='bg-zinc-900 border-zinc-800 mt-4'>
          <CardContent className='p-4'>
            <label htmlFor='wo-custom-message' className='block text-sm font-medium text-zinc-200 mb-2'>
              Message / Notes
            </label>
            <Textarea
              id='wo-custom-message'
              className='w-full'
              placeholder='Enter a message or notes for this work order...'
              ref={customMessageRef}
              defaultValue={workOrder?.message || ''}
            />
          </CardContent>
        </Card>
      </>
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
          onSuccess?.()
        }}
      />
    </CommonDialog>
  )
}

export default EditWorkOrderServicesModal
