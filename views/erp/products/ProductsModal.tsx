import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Product, ProductCategory, ServiceType, Unit, Vendor } from '@/types'
import { useState } from 'react'
import Products from './Products'

const ProductsModal = ({
  open,
  onOpenChange,
  productCategories = [],
  vendors = [],
  serviceTypes = [],
  uomUnits = [],
  onSelect,
  selected_vendor_id = null
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
  serviceTypes: ServiceType[]
  onSelect?: (value: Product[]) => void
  selected_vendor_id?: string | null
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
      loadingMessage='Loading products...'
      open={open}
      onOpenChange={onOpenChange}
      title={'Select Products'}
      description={''}
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
        <Products
          productCategories={productCategories}
          vendors={vendors}
          serviceTypes={serviceTypes}
          uomUnits={uomUnits}
          isFromModal={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
          selected_vendor_id={selected_vendor_id}
        />
      </>
    </CommonDialog>
  )
}

export default ProductsModal
