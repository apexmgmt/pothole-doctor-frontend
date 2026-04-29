'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, UserIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
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
import ServiceTypeSection from './CreateOrEditProposalModal/ServiceTypeSection'
import AddServiceButton from './CreateOrEditProposalModal/AddServiceButton'
import ProposalActionsDropdown from './CreateOrEditProposalModal/ProposalActionsDropdown'
import PaymentSettingModal from './CreateOrEditProposalModal/PaymentSettingModal'
import ClientDetailsCard from './CreateOrEditProposalModal/ClientDetailsCard'
import SalesRepresentativeCard from './CreateOrEditProposalModal/SalesRepresentativeCard'
import DiscountDetailsCard from './CreateOrEditProposalModal/DiscountDetailsCard'
import ProfitDetailsCard from './CreateOrEditProposalModal/ProfitDetailsCard'
import TotalCalculationCard from './CreateOrEditProposalModal/TotalCalculationCard'
import ProposalService from '@/services/api/estimates/proposals.service'
import { getDiscountedUnitPrice } from '@/utils/business-calculation'
import { useAppDispatch } from '@/lib/hooks'
import { setPageTitle } from '@/lib/features/pageTitle/pageTitleSlice'

const CreateOrEditProposalView = ({
  mode: initialMode = 'edit',
  estimateId,
  estimateDetails,
  proposalId,
  proposalDetails,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = []
}: {
  mode: 'create' | 'edit' | 'view'
  estimateId: string
  estimateDetails: Estimate
  proposalId?: string | null
  proposalDetails?: Proposal | null
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}) => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [isLoading, setIsLoading] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<{ id: string; name: string }[]>([])
  const [serviceSelectValue, setServiceSelectValue] = useState<string | undefined>(undefined)
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [currentProposalStatus, setCurrentProposalStatus] = useState<string | null | undefined>(proposalDetails?.status)

  const [currentProposalReason, setCurrentProposalReason] = useState<string | null | undefined>(
    (proposalDetails as any)?.reason
  )

  const [isPaymentSettingOpen, setIsPaymentSettingOpen] = useState(false)

  const [isDownPaymentMaterials, setIsDownPaymentMaterials] = useState(
    proposalDetails?.is_down_payment_materials ?? false
  )

  const [downPaymentAmount, setDownPaymentAmount] = useState(proposalDetails?.down_payment_amount ?? 0)
  const [downPaymentPercent, setDownPaymentPercent] = useState(proposalDetails?.down_payment_percentage ?? 0)

  const customMessageRef = useRef<HTMLTextAreaElement>(null)

  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; serviceTypeId: string; groupId: string | null; lines: ProposalServiceItemPayload[] }[]
  >([])

  const isVoidOrDead = currentProposalStatus === 'void proposal' || currentProposalStatus === 'dead proposal'
  const effectiveMode = isVoidOrDead ? ('view' as const) : initialMode
  const taxRate = estimateDetails?.tax_rate ?? 0

  useEffect(() => {
    const num = estimateDetails?.estimate_number?.toString().padStart(6, '0') ?? ''

    if (initialMode === 'create') {
      dispatch(setPageTitle(`New Proposal - Estimate #${num}`))
    } else {
      dispatch(setPageTitle(`${initialMode === 'view' ? 'View' : 'Edit'} Proposal - Estimate #${num}`))
    }
  }, [])

  const handleBack = () => {
    router.push(`/erp/estimates/${estimateId}`)
  }

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

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  const totalSales = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0)
    }

    const unitPrice = getDiscountedUnitPrice(line)

    return sum + unitPrice * line.qty
  }, 0)

  const profitAmount = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - (line.total_price ?? 0)
    }

    const unitPrice = getDiscountedUnitPrice(line)

    return sum + (unitPrice - line.unit_cost) * line.qty - (line.freight_charge ?? 0)
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

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

  const materialTotal = allLines
    .filter(line => line.type === 'product')
    .reduce((sum, line) => sum + (line.total_price ?? 0), 0)

  const totalDiscount = allLines.reduce((sum, line) => {
    if (line.type === 'comment' || line.type === 'deduction') return sum

    const baseUnitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)
    const discountedUnitPrice = getDiscountedUnitPrice(line)

    return sum + (baseUnitPrice - discountedUnitPrice) * line.qty
  }, 0)

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

  const resetForm = () => {
    setSelectedServiceType([])
    setServiceTypeLineItems([])
    setDiscountType('percentage')
    setDiscountValue(0)
    setServiceSelectValue(undefined)
    setServiceSelectOpen(false)
    setIsDownPaymentMaterials(false)
    setDownPaymentAmount(0)
    setDownPaymentPercent(0)
  }

  const submitProposal = async (payload: ProposalPayload) => {
    if (initialMode === 'create') {
      return ProposalService.store(payload)
    }

    if (initialMode === 'edit' && proposalId) {
      return ProposalService.update(proposalId, payload)
    }

    throw new Error('Invalid mode or missing proposal ID')
  }

  const onSubmit = async () => {
    setIsLoading(true)

    const payload = buildPayload()

    try {
      await submitProposal(payload)
      toast.success(initialMode === 'create' ? 'Proposal created successfully' : 'Proposal updated successfully')

      //   resetForm()
      router.push(`/erp/estimates/${estimateId}`)
    } catch (error: any) {
      toast.error(error?.message || `Failed to ${initialMode === 'create' ? 'create' : 'update'} proposal.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailWithSave = async () => {
    setIsLoading(true)

    try {
      let savedId = proposalId

      if (initialMode === 'create' || initialMode === 'edit') {
        const response = await submitProposal(buildPayload())

        savedId = response?.data?.id || proposalId
        toast.success(initialMode === 'create' ? 'Proposal created successfully' : 'Proposal updated successfully')
      }

      if (!savedId) throw new Error('Proposal ID not found')

      await ProposalService.sendEmail(savedId)
      toast.success('Proposal emailed to customer successfully')

      if (initialMode !== 'view') {
        resetForm()
        router.push(`/erp/estimates/${estimateId}`)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save and send proposal.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ((initialMode === 'edit' || initialMode === 'view') && proposalDetails) {
      const newSelectedServiceType = (proposalDetails.services || []).map(service => ({
        id: service.service_type_id,
        name: service.service_type?.name || ''
      }))

      setSelectedServiceType(newSelectedServiceType)

      const newServiceTypeLineItems = (proposalDetails.services || []).map(service => ({
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

      setServiceTypeLineItems(newServiceTypeLineItems)
      setDiscountType(proposalDetails.discount_type)
      setDiscountValue(proposalDetails.discount)
      setCurrentProposalStatus(proposalDetails.status)
      setCurrentProposalReason((proposalDetails as any)?.reason ?? null)
      setIsDownPaymentMaterials(proposalDetails.is_down_payment_materials ?? false)
      setDownPaymentAmount(proposalDetails.down_payment_amount ?? 0)
      setDownPaymentPercent(proposalDetails.down_payment_percentage ?? 0)
    }
  }, [initialMode, proposalDetails])

  return (
    <div className='space-y-4'>
      {/* Page header */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' onClick={handleBack} disabled={isLoading}>
          <ChevronLeftIcon className='h-4 w-4 mr-2' />
          Back to Estimate
        </Button>
        <div className='flex items-center gap-2'>
          {downPaymentAmount > 0 && (
            <span className='text-sm font-semibold text-zinc-200 border border-zinc-600 rounded px-3 py-1'>
              Down Payment: ${Number(downPaymentAmount ?? 0).toFixed(2)}
            </span>
          )}
          {effectiveMode !== 'view' && (
            <AddServiceButton
              serviceTypes={serviceTypes}
              selectedServiceTypeIds={selectedServiceType.map(st => st.id)}
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
            onSuccess={() => router.push(`/erp/estimates/${estimateId}`)}
            onPaymentSettingClick={() => setIsPaymentSettingOpen(true)}
            mode={initialMode}
          />
        </div>
      </div>

      {/* Estimate info bar */}
      <div className='flex gap-4 items-center'>
        <p className='text-lg font-bold'>Estimate #{estimateDetails?.estimate_number?.toString().padStart(6, '0')}</p>
        <p className='text-sm font-semibold text-zinc-200'>
          <span>
            <UserIcon className='h-4 w-4 inline-block mr-2' />
          </span>
          {estimateDetails?.client?.first_name + ' ' + estimateDetails?.client?.last_name}
        </p>
      </div>

      {/* Summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        <ClientDetailsCard estimateDetails={estimateDetails} />
        <SalesRepresentativeCard estimateDetails={estimateDetails} />
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
            toast.success(`Discount applied: ${type === 'percentage' ? `${value}%` : `$${value.toFixed(2)}`}`)
          }}
        />
        <ProfitDetailsCard profitPercent={profitPercent} profitAmount={profitAmount} totalProfit={profitAmount} />
        <TotalCalculationCard subtotal={totalSales} salesTax={salesTax} total={total} />
      </div>

      {/* Service type sections */}
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

      {/* Custom message */}
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

      {/* Reason for void/dead status */}
      {(currentProposalStatus === 'void proposal' || currentProposalStatus === 'dead proposal') &&
        currentProposalReason && (
          <Card className='border-red-800'>
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

      {/* Footer actions */}
      <div className='flex justify-end gap-3 pt-2'>
        <Button type='button' variant='outline' onClick={handleBack} disabled={isLoading} className='flex-1 max-w-40'>
          Cancel
        </Button>
        {effectiveMode !== 'view' && (
          <Button type='submit' onClick={onSubmit} disabled={isLoading} className='flex-1 max-w-40'>
            {isLoading ? 'Saving...' : initialMode === 'create' ? 'Create' : 'Update'}
          </Button>
        )}
      </div>

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
    </div>
  )
}

export default CreateOrEditProposalView
