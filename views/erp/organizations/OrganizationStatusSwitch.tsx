import React from 'react'

import { Switch } from '@/components/ui/switch'
import ConfirmDialog from '@/components/erp/common/dialogs/ConfirmDialog'
import OrganizationService from '@/services/api/organizations.service'

interface OrganizationStatusSwitchProps {
  checked: boolean
  loading?: boolean
  companyId: string
  fetchData?: () => void // optional
}

const OrganizationStatusSwitch: React.FC<OrganizationStatusSwitchProps> = ({
  checked,
  loading = false,
  companyId,
  fetchData
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
          <Switch
            checked={internalChecked}
            disabled={loading || isLoading}
            onClick={e => {
              e.stopPropagation()
              setOpen(true)
            }}
            onCheckedChange={() => {}}
          />
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
