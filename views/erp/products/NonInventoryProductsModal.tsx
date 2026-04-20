import { useState } from 'react'

import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Product, ProductCategory, ServiceType, Unit, Vendor } from '@/types'
import NonInventoryProducts from './NonInventoryProducts'

const NonInventoryProductsModal = ({
  open,
  onOpenChange,
  productCategories = [],
  vendors = [],
  serviceTypes = [],
  uomUnits = [],
  onSelect
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  serviceTypes: ServiceType[]
  onSelect?: (value: Product[]) => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Product[]>([])

  const onCancel = () => {
    onOpenChange(false)
  }

  const onSubmit = () => {
    if (onSelect) {
      onSelect(selectedRows)
    }

    onOpenChange(false)
    setSelectedRows([])
  }

  return (
    <CommonDialog
      isLoading={isLoading}
      loadingMessage='Loading non-inventory products...'
      open={open}
      onOpenChange={onOpenChange}
      title='Select Non-Inventory Products'
      description=''
      maxWidth='full'
      disableClose={isLoading}
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isLoading} className='flex-1'>
            Cancel
          </Button>
          <Button type='submit' onClick={onSubmit} disabled={isLoading} className='flex-1'>
            {isLoading ? 'Selecting...' : 'Select'}
          </Button>
        </div>
      }
    >
      <>
        <NonInventoryProducts
          productCategories={productCategories}
          vendors={vendors}
          serviceTypes={serviceTypes}
          uomUnits={uomUnits}
          isFromModal={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          hideActionButton={true}
        />
      </>
    </CommonDialog>
  )
}

export default NonInventoryProductsModal
