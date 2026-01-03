import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { LaborCost, ServiceType, Unit } from '@/types'
import { useState } from 'react'
import LaborCosts from './LaborCosts'

const LaborCostsModal = ({
  open,
  onOpenChange,
  serviceTypes = [],
  units = [],
  onSelect
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceTypes: ServiceType[]
  units: Unit[]
  onSelect?: (value: LaborCost[]) => void
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<LaborCost[]>([])

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
      loadingMessage='Loading labor costs...'
      open={open}
      onOpenChange={onOpenChange}
      title={'Select Labor Costs'}
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
        <LaborCosts
          serviceTypes={serviceTypes}
          units={units}
          isFromModal={true}
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </>
    </CommonDialog>
  )
}

export default LaborCostsModal
