import { useState } from 'react'
import { Settings2Icon, XIcon } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LaborCost, Product, ProductCategory, ProposalServiceItemPayload, ServiceType, Unit, Vendor } from '@/types'
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
  allowedLineTypes
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
}) => {
  const [openLaborCostModal, setOpenLaborCostModal] = useState(false)
  const [openProductsModal, setOpenProductsModal] = useState(false)
  const [openNonInventoryProductsModal, setOpenNonInventoryProductsModal] = useState(false)
  const [margin, setMargin] = useState('0')

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
                  {lines.map((line: ProposalServiceItemPayload, idx) => {
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
