import React from 'react'

import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import CustomFormField from '@/components/form/CustomFormField'
import OrganizationService from '@/services/api/organizations.service'
import { Badge } from '@/components/ui/badge'

interface OrganizationStatusSwitchProps {
  checked: boolean
  loading?: boolean
  companyId: string
  fetchData?: () => void // optional
  variant?: 'switch' | 'button'
}

const OrganizationStatusSwitch: React.FC<OrganizationStatusSwitchProps> = ({
  checked,
  loading = false,
  companyId,
  fetchData,
  variant = 'switch'
}) => {
  const [open, setOpen] = React.useState(false)
  const [internalChecked, setInternalChecked] = React.useState(checked)
  const [isLoading, setIsLoading] = React.useState(false)

  // Sync with parent checked prop
  React.useEffect(() => {
    setInternalChecked(checked)
  }, [checked])

  const handleConfirm = async () => {
    setIsLoading(true)
    const prevChecked = internalChecked

    setInternalChecked(!prevChecked)

    try {
      await OrganizationService.changeStatus(companyId)
      if (fetchData) fetchData()
    } catch (error) {
      setInternalChecked(prevChecked)
    }

    setIsLoading(false)
    setOpen(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <span>
          {variant === 'switch' && (
            <div
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
                if (!loading && !isLoading) setOpen(true)
              }}
            >
              <CustomFormField
                type='switch'
                name='status'
                value={internalChecked}
                disabled={loading || isLoading}
                onChange={() => {}}
                className='pointer-events-none'
              />
            </div>
          )}
          {variant === 'button' && (
            <Badge              variant={internalChecked ? 'success' : 'destructive'}
              onClick={e => {
                e.stopPropagation()
                setOpen(true)
              }}
              className='cursor-pointer'
            >
              {internalChecked ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </span>
      }
      title={internalChecked ? 'Deactivate Company?' : 'Activate Company?'}
      message={`Are you sure you want to ${internalChecked ? 'deactivate' : 'activate'} this company?`}
      cancelButtonTitle='Cancel'
      confirmButtonTitle={internalChecked ? 'Deactivate' : 'Activate'}
      onConfirm={handleConfirm}
      loading={loading || isLoading}
      confirmButtonProps={{
        className: internalChecked
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
      }}
    />
  )
}

export default OrganizationStatusSwitch
