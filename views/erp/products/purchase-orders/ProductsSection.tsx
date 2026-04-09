'use client'

import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Product, ProductCategory, ServiceType, Vendor } from '@/types'
import Products from '../Products'

interface ProductsSectionProps {
  selectedVendorId: string
  selectedProductRows: Product[]
  setSelectedProductRows: React.Dispatch<React.SetStateAction<Product[]>>
  vendors: Vendor[]
  productCategories: ProductCategory[]
  serviceTypes: ServiceType[]
  onAddSelected: () => void
}

const ProductsSection = ({
  selectedVendorId,
  selectedProductRows,
  setSelectedProductRows,
  vendors,
  productCategories,
  serviceTypes,
  onAddSelected
}: ProductsSectionProps) => {
  return (
    <div className='flex flex-col gap-3'>
      <div className='border border-border rounded-lg overflow-hidden min-h-[450px] max-h-[450px]'>
        {selectedVendorId ? (
          <Products
            productCategories={productCategories}
            uomUnits={[]}
            serviceTypes={serviceTypes}
            vendors={vendors}
            isFromModal={true}
            selectedRows={selectedProductRows}
            setSelectedRows={setSelectedProductRows}
            selected_vendor_id={selectedVendorId}
            hideTitle={true}
            hideActionButton={true}
          />
        ) : (
          <div className='flex items-center justify-center h-full min-h-[450px] text-muted-foreground text-sm'>
            Select a vendor to browse products
          </div>
        )}
      </div>

      <div className='flex justify-end'>
        <Button
          type='button'
          size='sm'
          onClick={onAddSelected}
          disabled={selectedProductRows.length === 0 || !selectedVendorId}
        >
          <PlusIcon className='w-4 h-4 mr-1' />
          Add Selected Products
        </Button>
      </div>
    </div>
  )
}

export default ProductsSection
