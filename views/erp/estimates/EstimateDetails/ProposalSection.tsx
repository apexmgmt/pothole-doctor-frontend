import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import CreateOrEditProposalModal from './CreateOrEditProposalModal'
import { Estimate } from '@/types/estimates.types'
import { ProductCategory, ServiceType, Unit, Vendor } from '@/types'

const ProposalSection = ({
  estimateId,
  estimateDetails,
  serviceTypes = [],
  units = [],
  productCategories = [],
  uomUnits = [],
  vendors = []
}: {
  estimateId: string
  estimateDetails: Estimate
  serviceTypes: ServiceType[]
  units: Unit[]
  productCategories: ProductCategory[]
  uomUnits: Unit[]
  vendors: Vendor[]
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')

  return (
    <>
      <Card className='bg-zinc-900 border-zinc-800'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-white text-base'>Proposal</CardTitle>
          <Button
            onClick={() => setIsModalOpen(true)}
            size='sm'
            variant='outline'
            className='text-xs px-3 py-1 bg-white text-black'
          >
            + New
          </Button>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md'>
            <span className='text-zinc-400 text-sm'>No Data</span>
          </div>
        </CardContent>
      </Card>
      <CreateOrEditProposalModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        mode={mode}
        estimateId={estimateId}
        estimateDetails={estimateDetails}
        serviceTypes={serviceTypes}
        units={units}
        productCategories={productCategories}
        uomUnits={uomUnits}
        vendors={vendors}
      />
    </>
  )
}

export default ProposalSection
