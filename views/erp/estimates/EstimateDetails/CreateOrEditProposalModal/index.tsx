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
import PaymentSettingModal from './PaymentSettingModal'
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
  const [currentProposalStatus, setCurrentProposalStatus] = useState<string | null | undefined>(proposalDetails?.status)

  const [currentProposalReason, setCurrentProposalReason] = useState<string | null | undefined>(
    (proposalDetails as any)?.reason
  )

  // Payment settings
  const [isPaymentSettingOpen, setIsPaymentSettingOpen] = useState(false)
  const [isDownPaymentMaterials, setIsDownPaymentMaterials] = useState(proposalDetails?.is_down_payment_materials ?? false)
  const [downPaymentAmount, setDownPaymentAmount] = useState(proposalDetails?.down_payment_amount ?? 0)
  const [downPaymentPercent, setDownPaymentPercent] = useState(proposalDetails?.down_payment_percentage ?? 0)

  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  const isVoidOrDead = currentProposalStatus === 'void proposal' || currentProposalStatus === 'dead proposal'
  const effectiveMode = isVoidOrDead ? ('view' as const) : mode
  const taxRate = estimateDetails?.tax_rate ?? 0

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
        return sum - unitPrice * line.qty * (taxRate / 100)
      }

      return sum + unitPrice * line.qty * (taxRate / 100)
    }, 0)

  const total = totalSales + salesTax

  // Material (product) line items total for down payment calculation
  const materialTotal = allLines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => sum + (line.total_price ?? 0), 0)

  // Calculate total discount amount
  const totalDiscount = allLines.reduce((sum, line) => {
    if (line.type === 'comment' || line.type === 'deduction') return sum

    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discountedUnitPrice = getDiscountedUnitPrice(line)

    return sum + (baseUnitPrice - discountedUnitPrice) * line.qty
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
    is_down_payment_materials: isDownPaymentMaterials,
    down_payment_amount: downPaymentAmount,
    down_payment_percentage: downPaymentPercent,
    services: serviceTypeLineItems.map((st, index) => ({
      service_type_id: selectedServiceType[index].id,
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

  const resetForm = () => {
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setCustomMessage('')
    setDiscountType('percentage')
    setDiscountValue(0)
    setServiceSelectValue(undefined)
    setServiceSelectOpen(false)
    setIsDownPaymentMaterials(false)
    setDownPaymentAmount(0)
    setDownPaymentPercent(0)
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
      setCurrentProposalStatus(proposalDetails.status)
      setCurrentProposalReason((proposalDetails as any)?.reason ?? null)
      setIsDownPaymentMaterials(proposalDetails.is_down_payment_materials ?? false)
      setDownPaymentAmount(proposalDetails.down_payment_amount ?? 0)
      setDownPaymentPercent(proposalDetails.down_payment_percentage ?? 0)
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
          {effectiveMode !== 'view' && (
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
            {downPaymentAmount > 0 && (
              <span className='text-sm font-semibold text-zinc-200 border border-zinc-600 rounded px-3 py-1'>
                Down Payment: ${Number(downPaymentAmount ?? 0).toFixed(2)}
              </span>
            )}
            {effectiveMode !== 'view' && (
              <AddServiceButton
                serviceTypes={serviceTypes}
                open={serviceSelectOpen}
                onOpenChange={setServiceSelectOpen}
                onSelect={handleAddServiceType}
              />
            )}
            <ProposalActionsDropdown
              onConfirmedEmailSend={handleEmailWithSave}
              isSending={isLoading}
              proposalId={proposalId}
              proposalStatus={currentProposalStatus}
              onStatusChange={setCurrentProposalStatus}
              onReasonChange={setCurrentProposalReason}
              onSuccess={onSuccess}
              onPaymentSettingClick={() => setIsPaymentSettingOpen(true)}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4'>
          {/* Client details */}
          <ClientDetailsCard estimateDetails={estimateDetails} />
          {/* Sales representative details */}
          <SalesRepresentativeCard estimateDetails={estimateDetails} />
          {/* Discount details */}
          <DiscountDetailsCard
            mode={effectiveMode}
            estimateDetails={estimateDetails}
            discountType={discountType}
            discountValue={discountValue}
            totalDiscount={totalDiscount}
            onApplyDiscount={(type, value) => {
              const allProductAndLaborLines = serviceTypeLineItems.flatMap(st =>
                st.lines.filter(line => line.type === 'product' || line.type === 'labor')
              )

              if (type === 'fixed') {
                // Grand total of base prices across all applicable lines
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

                // Proportional fixed discount per line: (line_base_total / grand_base_total) * total_discount
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
                // Percentage: set the same percentage on every applicable line
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
              mode={effectiveMode}
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
              taxRate={taxRate}
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
              disabled={effectiveMode === 'view'}
            />
          </CardContent>
        </Card>
        <PaymentSettingModal
          open={isPaymentSettingOpen}
          onOpenChange={setIsPaymentSettingOpen}
          total={total}
          materialTotal={materialTotal}
          initialValues={{
            isDownPaymentMaterials: isDownPaymentMaterials,
            downPaymentAmount: downPaymentAmount,
            downPaymentPercent: downPaymentPercent
          }}
          onSave={({ isDownPaymentMaterials: m, downPaymentAmount: a, downPaymentPercent: p }) => {
            setIsDownPaymentMaterials(m)
            setDownPaymentAmount(a)
            setDownPaymentPercent(p)
          }}
        />

        {/* Reason if status is void proposal or dead proposal */}
        {(currentProposalStatus === 'void proposal' || currentProposalStatus === 'dead proposal') &&
          currentProposalReason && (
            <Card className='border-red-800 mt-4'>
              <CardContent className='p-4'>
                <label htmlFor='reason' className='block text-sm font-medium text-zinc-200 mb-2'>
                  Reason
                </label>
                <p id='reason' className='w-full p-3 bg-zinc-800 rounded text-sm text-zinc-200'>
                  {currentProposalReason || 'No reason provided'}
                </p>
              </CardContent>
            </Card>
          )}
      </>
    </CommonDialog>
  )
}

export default CreateOrEditProposalModal
