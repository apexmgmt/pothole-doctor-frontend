import { useRef, useState } from 'react'
import { Settings2Icon, XIcon, WrenchIcon, UserIcon, ChevronDownIcon, StickyNoteIcon, CheckIcon } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LaborCost,
  Partner,
  Product,
  ProductCategory,
  ProposalServiceItemPayload,
  ServiceType,
  Unit,
  Vendor
} from '@/types'
import LaborCostsModal from '@/views/erp/labor-costs/LaborCostsModal'
import ProductsModal from '@/views/erp/products/ProductsModal'
import NonInventoryProductsModal from '@/views/erp/products/NonInventoryProductsModal'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import ServiceTypeSummary from './ServiceTypeSummary'
import ServiceTypeActions from './ServiceTypeActions'
import CommentRow from './CommentRow'
import LineItemRow from './LineItemRow'
import { useLineEditing } from './useLineEditing'
import { useServiceTypeLines } from './useServiceTypeLines'
import { useSummaryCalculations } from './useSummaryCalculations'
import ContractorActions from './ContractorActions'
import { ContractorNotesPopover } from './ContractorNotesPopover'

const ServiceTypeSection = ({
  mode,
  serviceTypeName,
  serviceTypeId,
  onRemove,
  serviceTypes = [],
  units = [],
  lines,
  onLinesChange,
  productCategories = [],
  uomUnits = [],
  vendors = [],
  taxRate = 0,
  hideMargin = false,
  hidePriceColumns = false,
  showVendor = false,
  showPurchaseQty = false,
  allowedLineTypes,
  showContractorOptions = false,
  contractors = [],
  contractorId = null,
  contractorNotes = null,
  onContractorChange,
  onAddSchedule
}: {
  mode: 'create' | 'edit' | 'view'
  serviceTypeId: string
  serviceTypeName: string
  onRemove: () => void
  serviceTypes: ServiceType[]
  units: Unit[]
  lines: ProposalServiceItemPayload[]
  onLinesChange: (lines: ProposalServiceItemPayload[]) => void
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  taxRate: number
  hideMargin?: boolean
  hidePriceColumns?: boolean
  showVendor?: boolean
  showPurchaseQty?: boolean
  allowedLineTypes?: ProposalServiceItemPayload['type'][]
  showContractorOptions?: boolean
  contractors?: Partner[]
  contractorId?: string | null
  contractorNotes?: string | null
  onContractorChange?: (contractorId: string | null, contractorNotes: string | null) => void
  onAddSchedule?: () => void
}) => {
  const [openLaborCostModal, setOpenLaborCostModal] = useState(false)
  const [openProductsModal, setOpenProductsModal] = useState(false)
  const [openNonInventoryProductsModal, setOpenNonInventoryProductsModal] = useState(false)
  const [margin, setMargin] = useState('0')
  const [showContractorNotes, setShowContractorNotes] = useState(false)
  const contractorNotesRef = useRef<HTMLTextAreaElement>(null)

  const { getEditValue, setEditValue, clearEditValue } = useLineEditing()

  const {
    recalculateLine,
    clampProductQty,
    addLine,
    updateLine,
    updateLineFields,
    removeLine,
    onLaborCostSelect,
    onProductSelect
  } = useServiceTypeLines({ lines, onLinesChange, taxRate, hideMargin })

  const summary = useSummaryCalculations(lines, taxRate)

  const sharedRowProps = { getEditValue, setEditValue, clearEditValue, updateLine, removeLine }

  // Split lines by type when contractor mode is active
  const mainLineEntries = showContractorOptions
    ? lines.map((line, idx) => ({ line, idx })).filter(({ line }) => line.type !== 'labor')
    : lines.map((line, idx) => ({ line, idx }))

  const laborLineEntries = showContractorOptions
    ? lines.map((line, idx) => ({ line, idx })).filter(({ line }) => line.type === 'labor')
    : []

  const hasLaborLines = laborLineEntries.length > 0

  const selectedContractor = contractors?.find(c => c.id === contractorId)

  const handleSelectContractor = (id: string) => {
    const newId = id === contractorId ? null : id

    onContractorChange?.(newId, contractorNotesRef.current?.value ?? contractorNotes ?? null)
  }

  const handleRemoveContractor = () => {
    onContractorChange?.(null, contractorNotesRef.current?.value ?? contractorNotes ?? null)
  }

  const handleNotesBlur = (notes: string) => {
    onContractorChange?.(contractorId ?? null, notes ?? null)
  }

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings2Icon className='h-5 w-5 text-blue-500' />
              <h3 className='text-lg font-semibold text-white'>{serviceTypeName}</h3>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onRemove}
              className='h-8 w-8 p-0 text-zinc-400 hover:text-red-500'
            >
              <XIcon className='h-4 w-4' />
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <ServiceTypeActions
            mode={mode}
            margin={margin}
            setMargin={setMargin}
            lines={lines}
            recalculateLine={recalculateLine}
            onLinesChange={onLinesChange}
            setOpenProductsModal={setOpenProductsModal}
            setOpenNonInventoryProductsModal={setOpenNonInventoryProductsModal}
            setOpenLaborCostModal={setOpenLaborCostModal}
            addLine={addLine}
            hideMargin={hideMargin}
            allowedLineTypes={allowedLineTypes}
          />

          <ServiceTypeSummary {...summary} simpleSummary={hideMargin} />

          <div className='rounded border border-zinc-800 mt-4'>
            <ScrollArea className='w-full'>
              <table className='min-w-full text-sm'>
                <thead className='bg-zinc-900 text-zinc-100'>
                  <tr className='text-left'>
                    <th className='px-2 py-1'>#</th>
                    <th className='px-2 py-1'>Item Name</th>
                    <th className='px-2 py-1'>Description</th>
                    {showVendor && <th className='px-2 py-1'>Vendor</th>}
                    <th className='px-2 py-1'>Unit Cost</th>
                    <th className='px-2 py-1'>Quantity</th>
                    <th className='px-2 py-1'>Total Cost</th>
                    {!hideMargin && <th className='px-2 py-1'>Margin</th>}
                    {!hidePriceColumns && <th className='px-2 py-1'>Unit Price</th>}
                    {!hidePriceColumns && <th className='px-2 py-1'>Total Price</th>}
                    <th className='px-2 py-1'>Sales Tax</th>
                    <th className='px-2 py-1'></th>
                  </tr>
                </thead>
                <tbody>
                  {mainLineEntries.map(({ line, idx }) => {
                    const hasActions = (line.material_job_actions?.length ?? 0) > 0
                    const isLocked = mode === 'view' || hasActions

                    if (line.type === 'comment') {
                      return (
                        <CommentRow
                          key={idx}
                          {...sharedRowProps}
                          line={line}
                          idx={idx}
                          isLocked={isLocked}
                          showVendor={showVendor}
                          hideMargin={hideMargin}
                          hidePriceColumns={hidePriceColumns}
                        />
                      )
                    }

                    return (
                      <LineItemRow
                        key={idx}
                        {...sharedRowProps}
                        line={line}
                        idx={idx}
                        mode={mode}
                        isLocked={isLocked}
                        hasActions={hasActions}
                        showVendor={showVendor}
                        showPurchaseQty={showPurchaseQty}
                        hideMargin={hideMargin}
                        hidePriceColumns={hidePriceColumns}
                        units={units}
                        vendors={vendors}
                        updateLineFields={updateLineFields}
                        clampProductQty={clampProductQty}
                      />
                    )
                  })}
                </tbody>
              </table>
              <ScrollBar orientation='horizontal' />
            </ScrollArea>
          </div>

          {/* Contractor Section — shown when showContractorOptions and there are labor lines */}
          {showContractorOptions && hasLaborLines && (
            <div className='rounded border border-blue-800/40 bg-blue-950/20 mt-4'>
              {/* Contractor Header */}
              <div className='flex items-center gap-2 px-3 py-2 border-b border-blue-800/30 flex-wrap'>
                <ContractorNotesPopover
                  notes={contractorNotes}
                  onSave={newNotes => handleNotesBlur(newNotes)}
                  disabled={mode === 'view'}
                />

                <div className='flex items-center gap-1.5'>
                  <UserIcon className='h-4 w-4 text-zinc-400' />
                  {selectedContractor ? (
                    <div className='flex items-center gap-1'>
                      <span className='text-sm font-medium text-zinc-200'>
                        {[selectedContractor.first_name, selectedContractor.last_name].filter(Boolean).join(' ') ||
                          'Contractor'}
                      </span>
                      {mode !== 'view' && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='h-5 w-5 p-0 text-zinc-500 hover:text-red-400'
                          onClick={handleRemoveContractor}
                        >
                          <XIcon className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <span className='text-sm text-zinc-500'>No Contractor Selected</span>
                  )}
                </div>
              </div>

              {/* Labor Lines Table */}
              <ScrollArea className='w-full'>
                <table className='min-w-full text-sm'>
                  <thead className='bg-blue-950/30 text-zinc-300'>
                    <tr className='text-left'>
                      <th className='px-2 py-1'>#</th>
                      <th className='px-2 py-1'>Labor Name</th>
                      <th className='px-2 py-1'>Description</th>
                      <th className='px-2 py-1'>Unit Cost</th>
                      <th className='px-2 py-1'>Quantity</th>
                      <th className='px-2 py-1'>Total Cost</th>
                      {!hideMargin && <th className='px-2 py-1'>Margin</th>}
                      {!hidePriceColumns && <th className='px-2 py-1'>Unit Price</th>}
                      {!hidePriceColumns && <th className='px-2 py-1'>Total Price</th>}
                      <th className='px-2 py-1'>Labor Tax</th>
                      <th className='px-2 py-1 flex justify-end'>
                        {mode !== 'view' && (
                          <ContractorActions
                            contractors={contractors}
                            contractorId={selectedContractor?.id || null}
                            handleSelectContractor={handleSelectContractor}
                            onAddSchedule={onAddSchedule}
                          />
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {laborLineEntries.map(({ line, idx }) => {
                      const hasActions = (line.material_job_actions?.length ?? 0) > 0
                      const isLocked = mode === 'view' || hasActions

                      return (
                        <LineItemRow
                          key={idx}
                          {...sharedRowProps}
                          line={line}
                          idx={idx}
                          mode={mode}
                          isLocked={isLocked}
                          hasActions={hasActions}
                          showVendor={false}
                          showPurchaseQty={false}
                          hideMargin={hideMargin}
                          hidePriceColumns={hidePriceColumns}
                          units={units}
                          vendors={vendors}
                          updateLineFields={updateLineFields}
                          clampProductQty={clampProductQty}
                        />
                      )
                    })}
                  </tbody>
                </table>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <LaborCostsModal
        open={openLaborCostModal}
        onOpenChange={setOpenLaborCostModal}
        serviceTypes={serviceTypes}
        units={units}
        onSelect={(laborCosts: LaborCost[]) => onLaborCostSelect(laborCosts)}
      />
      <ProductsModal
        open={openProductsModal}
        onOpenChange={setOpenProductsModal}
        serviceTypes={serviceTypes}
        productCategories={productCategories}
        uomUnits={uomUnits}
        vendors={vendors}
        onSelect={(products: Product[]) => onProductSelect(products)}
      />
      <NonInventoryProductsModal
        open={openNonInventoryProductsModal}
        onOpenChange={setOpenNonInventoryProductsModal}
        serviceTypes={serviceTypes}
        productCategories={productCategories}
        uomUnits={uomUnits}
        vendors={vendors}
        onSelect={(products: Product[]) => onProductSelect(products)}
      />
    </>
  )
}

export default ServiceTypeSection
