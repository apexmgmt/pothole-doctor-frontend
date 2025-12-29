import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Estimate, ProductCategory, ProposalServiceItemPayload, ServiceType, Unit, Vendor } from '@/types'
import { SettingsIcon, UserIcon } from 'lucide-react'
import { useState } from 'react'
import ClientDetailsCard from './ClientDetailsCard'
import SalesRepresentativeCard from './SalesRepresentativeCard'
import DiscountDetailsCard from './DiscountDetailsCard'
import ProfitDetailsCard from './ProfitDetailsCard'
import TotalCalculationCard from './TotalCalculationCard'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import ServiceTypeSection from './ServiceTypeSection'
import { Textarea } from '@/components/ui/textarea'

const CreateOrEditProposalModal = ({
  open,
  onOpenChange,
  mode = 'create',
  estimateId,
  estimateDetails,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = []
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  estimateId?: string
  estimateDetails?: Estimate
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [serviceSelectOpen, setServiceSelectOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<string[]>([])
  const [serviceSelectValue, setServiceSelectValue] = useState<string | undefined>(undefined)

  // Each service type section has an array of line items
  const [serviceTypeLineItems, setServiceTypeLineItems] = useState<
    { serviceTypeName: string; lines: ProposalServiceItemPayload[] }[]
  >([])

  const onCancel = () => {
    onOpenChange(false)
  }

  const handleAddServiceType = (serviceTypeId: string) => {
    const found = serviceTypes.find(st => st.id === serviceTypeId)

    if (found) {
      setSelectedServiceType(prev => [...prev, found.name]) // just add name, allow duplicates
    }

    setServiceSelectOpen(false)
  }

  const handleRemoveServiceType = (index: number) => {
    setSelectedServiceType(prev => prev.filter((_, i) => i !== index))
  }

  const allLines = serviceTypeLineItems.flatMap(st => st.lines)

  // Profit and sales calculations
  const totalSales = allLines.reduce((sum, line) => {
    const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

    if (line.type === 'deduction') {
      return sum - unitPrice * line.qty
    }

    return sum + unitPrice * line.qty
  }, 0)

  const profitAmount = allLines.reduce((sum, line) => {
    const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

    if (line.type === 'deduction') {
      return sum - (unitPrice - line.unit_cost) * line.qty
    }

    return sum + (unitPrice - line.unit_cost) * line.qty
  }, 0)

  const profitPercent = totalSales > 0 ? (profitAmount / totalSales) * 100 : 0

  const subtotal = allLines.reduce((sum, line) => {
    if (line.type === 'deduction') {
      return sum - line.unit_cost * line.qty
    }

    return sum + line.unit_cost * line.qty
  }, 0)

  const salesTax = allLines
    .filter(line => line.is_sale)
    .reduce((sum, line) => {
      const unitPrice = line.margin >= 100 ? 0 : line.unit_cost / (1 - line.margin / 100)

      if (line.type === 'deduction') {
        return sum - unitPrice * line.qty * 0.0 // 0% tax as example
      }

      return sum + unitPrice * line.qty * 0.0 // 0% tax as example
    }, 0)

  const total = totalSales + salesTax

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading proposal...'
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Create New Proposal' : 'Edit Proposal'}
      description={mode === 'create' ? 'Add a new proposal to the system' : 'Update proposal information'}
      maxWidth='full'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={() => {}} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </Button>
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
          <div className='relative'>
            <Button variant='outline' type='button' onClick={() => setServiceSelectOpen(true)} id='add-service-btn'>
              <span>
                <SettingsIcon className='h-4 w-4 inline-block mr-2' />
              </span>
              Add Service
            </Button>
            <Select
              open={serviceSelectOpen}
              value=''
              onOpenChange={setServiceSelectOpen}
              onValueChange={value => {
                handleAddServiceType(value)
              }}
            >
              {/* 
                The SelectTrigger is visually hidden but present for popper positioning.
                It is absolutely positioned over the button.
              */}
              <SelectTrigger
                className='absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none'
                aria-label='Add Service'
                tabIndex={-1}
              />
              <SelectContent position='popper' align='end'>
                {serviceTypes.map(st => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4'>
          {/* Client details */}
          <ClientDetailsCard estimateDetails={estimateDetails} />
          {/* Sales representative details */}
          <SalesRepresentativeCard estimateDetails={estimateDetails} />
          {/* Discount details */}
          <DiscountDetailsCard estimateDetails={estimateDetails} />
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
          {selectedServiceType.map((name, idx) => (
            <ServiceTypeSection
              key={idx}
              serviceTypeName={name}
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
            <Textarea id='custom-message' className='w-full' placeholder='Enter a custom message for the proposal...' />
          </CardContent>
        </Card>
      </>
    </CommonDialog>
  )
}

export default CreateOrEditProposalModal
