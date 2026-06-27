import { useRef, useState } from 'react'
import { Settings2Icon, XIcon, UserIcon } from 'lucide-react'

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

import ServiceTypeSummary from './ServiceTypeSummary'
import ServiceTypeActions from './ServiceTypeActions'
import CommentRow from './CommentRow'
import LineItemRow from './LineItemRow'
import { useLineEditing } from './useLineEditing'
import { useServiceTypeLines } from './useServiceTypeLines'
import { useSummaryCalculations } from './useSummaryCalculations'
import ContractorActions from './ContractorActions'
import { ContractorNotesPopover } from './ContractorNotesPopover'

/**
 * `ServiceTypeSection` is a complex interactive component that renders a distinct section of a proposal/estimate 
 * (e.g. a specific trade or phase of a project, like "Painting" or "Roofing").
 * It encapsulates the list of service items (products, labor, comments, deductions), financial summaries, 
 * contractor assignment features, and inline editing capabilities.
 * 
 * @param mode - Determines if the section is editable ('create' | 'edit') or read-only ('view').
 * @param serviceTypeName - The display name of the service type section.
 * @param serviceTypeId - The unique identifier of the service type.
 * @param onRemove - Callback to remove this entire section from the estimate.
 * @param serviceTypes - List of available service types for mapping.
 * @param units - List of available units of measure for dropdowns.
 * @param lines - The array of line items (products, labor, etc.) belonging to this section.
 * @param onLinesChange - Callback to update the lines array in the parent state.
 * @param productCategories - Categories available for product selection modals.
 * @param uomUnits - Units of measure for product selection modals.
 * @param vendors - Available vendors for products and items.
 * @param taxRate - The global tax percentage applied to taxable items in this section.
 * @param hideMargin - If true, hides margin columns and calculations from the UI.
 * @param hidePriceColumns - If true, hides unit/total price columns from the UI.
 * @param showVendor - If true, displays the vendor column in the line items table.
 * @param showPurchaseQty - If true, displays purchase quantity fields.
 * @param documentTypeName - Contextual name of the parent document (e.g. "Estimate" or "Invoice").
 * @param allowedLineTypes - Specifies which types of lines (product, labor, etc.) can be added.
 * @param showContractorOptions - Enables the separate table for labor lines and contractor assignment.
 * @param contractors - List of available contractors for assignment.
 * @param contractorId - The ID of the currently assigned contractor (if any).
 * @param contractorNotes - Notes associated with the assigned contractor.
 * @param onContractorChange - Callback when a contractor is assigned, removed, or notes change.
 * @param onAddSchedule - Callback to trigger schedule creation for the contractor.
 * @param lineErrors - Validation errors mapped by line index.
 * @param hideDiscountOption - Hides discount inputs on line items if true.
 * @param hideTaxOption - Hides tax toggles on line items if true.
 * @param isOrderActionVisible - Function determining if an "Order" action button is shown for a line.
 * @param onOrderActionClick - Callback when a line's "Order" action is clicked.
 * @param isPurchaseOrderActionVisible - Function determining if a "PO" action button is shown for a line.
 * @param onPurchaseOrderActionClick - Callback when a line's "PO" action is clicked.
 * @param showSkuStyleColor - If true, displays SKU, Style, and Color columns for product lines.
 */
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
  documentTypeName,
  allowedLineTypes,
  showContractorOptions = false,
  contractors = [],
  contractorId = null,
  contractorNotes = null,
  onContractorChange,
  onAddSchedule,
  lineErrors,
  hideTaxOption = false,
  hideDiscountOption = false,
  isOrderActionVisible,
  onOrderActionClick,
  isPurchaseOrderActionVisible,
  onPurchaseOrderActionClick,
  showSkuStyleColor = false
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
  documentTypeName?: string | null
  allowedLineTypes?: ProposalServiceItemPayload['type'][]
  showContractorOptions?: boolean
  contractors?: Partner[]
  contractorId?: string | null
  contractorNotes?: string | null
  onContractorChange?: (contractorId: string | null, contractorNotes: string | null) => void
  onAddSchedule?: () => void
  lineErrors?: Record<number, Record<string, string>>
  hideDiscountOption?: boolean
  hideTaxOption?: boolean
  isOrderActionVisible?: (line: ProposalServiceItemPayload) => boolean
  onOrderActionClick?: (line: ProposalServiceItemPayload) => void
  isPurchaseOrderActionVisible?: (line: ProposalServiceItemPayload) => boolean
  onPurchaseOrderActionClick?: (line: ProposalServiceItemPayload) => void
  showSkuStyleColor?: boolean
}) => {
  const resolvedLineErrors = lineErrors ?? {}
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
      <Card className='bg-accent/20 border-accent'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Settings2Icon className='h-5 w-5 text-blue-500' />
              <h3 className='text-lg font-semibold text-white'>{serviceTypeName}</h3>
            </div>
            {mode !== 'view' && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onRemove}
                className='h-8 w-8 p-0 text-accent-foreground hover:text-red-500'
              >
                <XIcon className='h-4 w-4' />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {mode !== 'view' && (
            <ServiceTypeActions
              mode={mode}
              documentTypeName={documentTypeName}
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
          )}

          <ServiceTypeSummary {...summary} simpleSummary={hideMargin} />

          <div className='rounded-xl border border-accent bg-accent/30 mt-4'>
            <ScrollArea className='w-full'>
              <table className='min-w-full text-xs rounded-xl'>
                <thead>
                  <tr className='text-left bg-accent/40 text-accent-foreground'>
                    <th className='px-2 py-1 whitespace-nowrap'>#</th>
                    <th className='px-2 py-1 whitespace-nowrap'>Item Name</th>
                    <th className='px-2 py-1 whitespace-nowrap'>Description</th>
                    {showVendor && <th className='px-2 py-1 whitespace-nowrap'>Vendor</th>}
                    {showSkuStyleColor && (
                      <>
                        <th className='px-2 py-1 whitespace-nowrap'>SKU</th>
                        <th className='px-2 py-1 whitespace-nowrap'>Style</th>
                        <th className='px-2 py-1 whitespace-nowrap'>Color</th>
                      </>
                    )}

                    <th className='px-2 py-1 whitespace-nowrap'>Unit Cost</th>
                    <th className='px-2 py-1 whitespace-nowrap'>Quantity</th>
                    <th className='px-2 py-1 whitespace-nowrap'>Total Cost</th>
                    {!hideMargin && <th className='px-2 py-1 whitespace-nowrap'>Margin</th>}
                    {!hidePriceColumns && <th className='px-2 py-1 whitespace-nowrap'>Unit Price</th>}
                    {!hidePriceColumns && <th className='px-2 py-1 whitespace-nowrap'>Total Price</th>}
                    {!hideTaxOption && <th className='px-2 py-1 whitespace-nowrap'>Sales Tax</th>}
                    <th className='px-2 py-1 whitespace-nowrap'></th>
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
                          showSkuStyleColor={showSkuStyleColor}
                        />
                      )
                    }

                    return (
                      <LineItemRow
                        key={idx}
                        {...sharedRowProps}
                        line={line}
                        idx={idx}
                        fieldErrors={resolvedLineErrors[idx]}
                        mode={mode}
                        isLocked={isLocked}
                        hasActions={hasActions}
                        showVendor={showVendor}
                        showPurchaseQty={showPurchaseQty}
                        hideMargin={hideMargin}
                        hidePriceColumns={hidePriceColumns}
                        hideTaxOption={hideTaxOption}
                        hideDiscountOption={hideDiscountOption}
                        units={units}
                        vendors={vendors}
                        updateLineFields={updateLineFields}
                        clampProductQty={clampProductQty}
                        showOrderAction={Boolean(isOrderActionVisible?.(line))}
                        onOrderActionClick={
                          isOrderActionVisible?.(line) && onOrderActionClick
                            ? () => onOrderActionClick(line)
                            : undefined
                        }
                        showPurchaseOrderAction={Boolean(isPurchaseOrderActionVisible?.(line))}
                        onPurchaseOrderClick={
                          isPurchaseOrderActionVisible?.(line) && onPurchaseOrderActionClick
                            ? () => onPurchaseOrderActionClick(line)
                            : undefined
                        }
                        showSkuStyleColor={showSkuStyleColor}
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
            <div className='rounded-xl border bg-accent/30 border-accent mt-4'>
              {/* Contractor Header */}
              <div className='flex items-center gap-2 px-3 py-2 flex-wrap'>
                <ContractorNotesPopover
                  notes={contractorNotes}
                  onSave={newNotes => handleNotesBlur(newNotes)}
                  disabled={mode === 'view'}
                />

                <div className='flex items-center gap-1.5'>
                  <UserIcon className='h-4 w-4 text-accent-foreground' />
                  {selectedContractor ? (
                    <div className='flex items-center gap-1'>
                      <span className='text-sm font-medium text-zinc-200'>
                        {[selectedContractor.first_name, selectedContractor.last_name].filter(Boolean).join(' ') ||
                          selectedContractor?.userable?.company?.name ||
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
                <table className='min-w-full text-xs'>
                  <thead className='bg-accent/40 text-accent-foreground'>
                    <tr className='text-left'>
                      <th className='px-2 py-1 whitespace-nowrap'>#</th>
                      <th className='px-2 py-1 whitespace-nowrap'>Labor Name</th>
                      <th className='px-2 py-1 whitespace-nowrap'>Description</th>
                      <th className='px-2 py-1 whitespace-nowrap'>Unit Cost</th>
                      <th className='px-2 py-1 whitespace-nowrap'>Quantity</th>
                      <th className='px-2 py-1 whitespace-nowrap'>Total Cost</th>
                      {!hideMargin && <th className='px-2 py-1 whitespace-nowrap'>Margin</th>}
                      {!hidePriceColumns && <th className='px-2 py-1 whitespace-nowrap'>Unit Price</th>}
                      {!hidePriceColumns && <th className='px-2 py-1 whitespace-nowrap'>Total Price</th>}
                      {/* <th className='px-2 py-1 whitespace-nowrap'>Labor Tax</th> */}
                      <th className='px-2 py-1 whitespace-nowrap flex justify-end'>
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
                          fieldErrors={resolvedLineErrors[idx]}
                          mode={mode}
                          isLocked={isLocked}
                          hasActions={hasActions}
                          showVendor={false}
                          showPurchaseQty={false}
                          hideMargin={hideMargin}
                          hidePriceColumns={hidePriceColumns}
                          hideTaxOption={true}
                          units={units}
                          vendors={vendors}
                          updateLineFields={updateLineFields}
                          clampProductQty={clampProductQty}
                          showOrderAction={Boolean(isOrderActionVisible?.(line))}
                          onOrderActionClick={
                            isOrderActionVisible?.(line) && onOrderActionClick
                              ? () => onOrderActionClick(line)
                              : undefined
                          }
                          showPurchaseOrderAction={Boolean(isPurchaseOrderActionVisible?.(line))}
                          onPurchaseOrderClick={
                            isPurchaseOrderActionVisible?.(line) && onPurchaseOrderActionClick
                              ? () => onPurchaseOrderActionClick(line)
                              : undefined
                          }
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
