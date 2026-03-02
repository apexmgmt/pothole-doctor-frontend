import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Estimate,
  ProductCategory,
  Proposal,
  ProposalPayload,
  ProposalServiceItemPayload,
  ServiceType,
  Unit,
  Vendor
} from '@/types'
import { UserIcon } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import ClientDetailsCard from './ClientDetailsCard'
import SalesRepresentativeCard from './SalesRepresentativeCard'
import DiscountDetailsCard from './DiscountDetailsCard'
import ProfitDetailsCard from './ProfitDetailsCard'
import TotalCalculationCard from './TotalCalculationCard'
import ServiceTypeSection from './ServiceTypeSection'
import AddServiceButton from './AddServiceButton'
import ProposalActionsDropdown from './ProposalActionsDropdown'
import { Textarea } from '@/components/ui/textarea'
import ProposalService from '@/services/api/estimates/proposals.service'
import { toast } from 'sonner'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'

const CreateOrEditProposalModal = ({
  open,
  onOpenChange,
  mode = 'create',
  estimateId,
  estimateDetails,
  proposalId,
  proposalDetails,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = [],
  onSuccess
}: {
  open: boolean
  onOpenChange: () => void
  mode: 'create' | 'edit' | 'view'
  estimateId?: string
  estimateDetails?: Estimate
  proposalId?: string | null
  proposalDetails?: Proposal | null
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  onSuccess?: () => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])
  const [serviceSelectValue, setServiceSelectValue] = useState<string | undefined>(undefined)
  const [customMessage, setCustomMessage] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  // Each service type section has an array of line items
  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; lines: ProposalServiceItemPayload[] }[]
  >([])

  const onCancel = () => {
    // Reset the data
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setCustomMessage('')
    setDiscountType('percentage')
    setDiscountValue(0)
    setServiceSelectValue(undefined)
    setServiceSelectOpen(false)
    onOpenChange()
  }

  const handleAddServiceType = (serviceTypeId: string) => {
    const found = serviceTypes.find(st => st.id === serviceTypeId)

    if (found) {
      setSelectedServiceType(prev => [...prev, { id: found.id, name: found.name }])
    }

    setServiceSelectOpen(false)
  }

  const handleRemoveServiceType = (index: number) => {
    setSelectedServiceType(prev => prev.filter((_, i) => i !== index))
  }

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  // Profit and sales calculations
  const totalSales = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Use total_price directly for deductions
    }

    const unitPrice = getDiscountedUnitPrice(line)

    return sum + unitPrice * line.qty
  }, 0)

  const profitAmount = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Deduction reduces profit
    }

    const unitPrice = getDiscountedUnitPrice(line)

    return sum + (unitPrice - line.unit_cost) * line.qty - (line.freight_charge ?? 0)
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

  const subtotal = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0) // Use total_price directly for deductions
    }

    if (line.type === 'comment') {
      return sum
    }

    return sum + (line?.total_price ?? 0)
  }, 0)

  const salesTax = allLines
    .filter(line => line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = getDiscountedUnitPrice(line)

      if (line.type === 'deduction') {
        return sum - unitPrice * line.qty * 0.0 // 0% tax as example
      }

      return sum + unitPrice * line.qty * 0.0 // 0% tax as example
    }, 0)

  const total = totalSales + salesTax

  // Calculate total discount amount
  const totalDiscount = allLines.reduce((sum, line) => {
    if (line.type === 'comment' || line.type === 'deduction') {
      return sum
    }

    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discount = line.discount ?? 0
    const discountType = line.discount_type ?? 'percentage'

    let discountAmount = 0

    if (discountType === 'fixed') {
      discountAmount = discount * line.qty
    } else {
      discountAmount = (baseUnitPrice * discount) / 100
    }

    return sum + discountAmount
  }, 0)

  const onSubmit = async () => {
    setIsLoading(true)

    const payload: ProposalPayload = buildPayload()

    try {
      await submitProposal(payload)
      toast.success(mode === 'create' ? 'Proposal created successfully' : 'Proposal updated successfully')
      resetForm()
      onOpenChange()
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${mode === 'create' ? 'create' : 'update'} proposal.`)
    } finally {
      setIsLoading(false)
    }
  }

  const buildPayload = (): ProposalPayload => ({
    estimate_id: estimateId || '',
    message: customMessageRef.current?.value || '',
    discount_type: discountType,
    discount: discountValue,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index].id,
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
        tax: line.tax,
        tax_amount: line.tax_amount,
        total_price: line.total_price,
        note: line.note
      }))
    }))
  })

  const resetForm = () => {
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setCustomMessage('')
    setDiscountType('percentage')
    setDiscountValue(0)
    setServiceSelectValue(undefined)
    setServiceSelectOpen(false)
  }

  // Submits the proposal and returns the API response. Does NOT touch loading state.
  const submitProposal = async (payload: ProposalPayload) => {
    if (mode === 'create') {
      return ProposalService.store(payload)
    }

    if (mode === 'edit' && proposalId) {
      return ProposalService.update(proposalId, payload)
    }

    throw new Error('Invalid mode or missing proposal ID')
  }

  // Save the proposal first, then send the email.
  const handleEmailWithSave = async () => {
    setIsLoading(true)

    try {
      let savedId = proposalId

      if (mode === 'create' || mode === 'edit') {
        const response = await submitProposal(buildPayload())

        savedId = response?.data?.id || proposalId
        toast.success(mode === 'create' ? 'Proposal created successfully' : 'Proposal updated successfully')
      }

      if (!savedId) throw new Error('Proposal ID not found')

      await ProposalService.sendEmail(savedId)
      toast.success('Proposal emailed to customer successfully')

      if (mode !== 'view') {
        resetForm()
        onOpenChange()
        onSuccess?.()
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save and send proposal.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && proposalDetails) {
      // Prepare selectedServiceType
      const newSelectedServiceType = (proposalDetails.services || []).map(service => ({
        id: service.service_type_id,
        name: service.service_type?.name || ''
      }))

      setSelectedServiceType(newSelectedServiceType)

      // Prepare serviceTypeLineItems
      const newServiceTypeLineItems = (proposalDetails.services || []).map(service => ({
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
      setCustomMessage(proposalDetails.message || '')
      setDiscountType(proposalDetails.discount_type)
      setDiscountValue(proposalDetails.discount)
    }
  }, [mode, proposalDetails])

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading proposal...'
      open={open}
      onOpenChange={onCancel}
      title={mode === 'create' ? 'Create New Proposal' : mode === 'edit' ? 'Edit Proposal' : 'View Proposal'}
      description={
        mode === 'create'
          ? 'Add a new proposal to the system'
          : mode === 'edit'
            ? 'Update proposal information'
            : 'View proposal details'
      }
      maxWidth='full'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          {mode !== 'view' && (
            <Button type='submit' onClick={() => onSubmit()} disabled={isLoading} className='flex-1'>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          )}
        </div>
      }
    >
      <>
        <div className='flex justify-between mb-4'>
          <div className='flex gap-4 items-center'>
            <p className='text-lg font-bold'>
              Estimate #{estimateDetails?.estimate_number?.toString().padStart(6, '0')}
            </p>
            <p className='text-sm font-semibold text-zinc-200'>
              <span>
                <UserIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              {estimateDetails?.client?.first_name + ' ' + estimateDetails?.client?.last_name}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {mode !== 'view' && (
              <AddServiceButton
                serviceTypes={serviceTypes}
                open={serviceSelectOpen}
                onOpenChange={setServiceSelectOpen}
                onSelect={handleAddServiceType}
              />
            )}
            <ProposalActionsDropdown onConfirmedEmailSend={handleEmailWithSave} isSending={isLoading} />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4'>
          {/* Client details */}
          <ClientDetailsCard estimateDetails={estimateDetails} />
          {/* Sales representative details */}
          <SalesRepresentativeCard estimateDetails={estimateDetails} />
          {/* Discount details */}
          <DiscountDetailsCard
            mode={mode}
            estimateDetails={estimateDetails}
            discountType={discountType}
            discountValue={discountValue}
            totalDiscount={totalDiscount}
            onApplyDiscount={(type, value) => {
              // Validate and apply discount to all product and labor-cost lines
              const allProductAndLaborLines = serviceTypeLineItems.flatMap(st =>
                st.lines.filter(line => line.type === 'product' || line.type === 'labor')
              )

              // For fixed discount, check if it's less than all unit costs
              if (type === 'fixed') {
                const maxUnitCost = Math.max(...allProductAndLaborLines.map(line => line.unit_cost))

                if (value > maxUnitCost) {
                  toast.error(
                    `Fixed discount ($${value.toFixed(2)}) cannot exceed the maximum unit cost ($${maxUnitCost.toFixed(2)})`
                  )

                  return
                }
              }

              // Apply discount to all service type line items
              setServiceTypeLineItems(prev =>
                prev.map(st => ({
                  ...st,
                  lines: st.lines.map(line =>
                    line.type === 'product' || line.type === 'labor'
                      ? { ...line, discount: value, discount_type: type }
                      : line
                  )
                }))
              )

              setDiscountType(type)
              setDiscountValue(value)
              toast.success(`Discount applied: ${type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`}`)
            }}
          />
          {/* Profit details */}
          <ProfitDetailsCard
            profitPercent={profitPercent}
            profitAmount={profitAmount}
            totalProfit={profitAmount} // or another calculation if needed
          />
          {/* Total calculation details */}
          <TotalCalculationCard subtotal={totalSales} salesTax={salesTax} total={total} />
        </div>

        {/* Service Type Sections */}
        <div className='space-y-4'>
          {selectedServiceType.map((item, idx) => (
            <ServiceTypeSection
              key={idx}
              mode={mode}
              serviceTypeName={item.name}
              serviceTypeId={item.id}
              onRemove={() => handleRemoveServiceType(idx)}
              serviceTypes={serviceTypes}
              units={units}
              lines={serviceTypeLineItems[idx]?.lines || []}
              onLinesChange={lines => {
                setServiceTypeLineItems(prev => {
                  const copy = [...prev]

                  copy[idx] = { ...copy[idx], lines }

                  return copy
                })
              }}
              productCategories={productCategories}
              uomUnits={uomUnits}
              vendors={vendors}
            />
          ))}
        </div>
        {/* Custom message field */}
        <Card className='bg-zinc-900 border-zinc-800'>
          <CardContent className='p-4'>
            <label htmlFor='custom-message' className='block text-sm font-medium text-zinc-200 mb-2'>
              Custom Message
            </label>
            <Textarea
              id='custom-message'
              className='w-full'
              placeholder='Enter a custom message for the proposal...'
              ref={customMessageRef}
              defaultValue={proposalDetails?.message || ''}
              disabled={mode === 'view'}
            />
          </CardContent>
        </Card>
      </>
    </CommonDialog>
  )
}

export default CreateOrEditProposalModal
