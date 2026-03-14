'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'

export interface PaymentSettingValues {
  isDownPaymentMaterials: boolean
  downPaymentAmount: number
  downPaymentPercent: number
}

interface PaymentSettingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  materialTotal: number
  initialValues: PaymentSettingValues
  onSave: (values: PaymentSettingValues) => void
}

const PaymentSettingModal = ({
  open,
  onOpenChange,
  total,
  materialTotal,
  initialValues,
  onSave
}: PaymentSettingModalProps) => {
  const [isMaterials, setIsMaterials] = useState(false)
  const [amountStr, setAmountStr] = useState('0')
  const [percentStr, setPercentStr] = useState('0')

  // When modal opens, seed values — default amount to total if unset (0/null)
  useEffect(() => {
    if (!open) return

    const initMaterials = initialValues.isDownPaymentMaterials
    const initAmount = initialValues.downPaymentAmount || total
    const initPercent = total > 0 ? (initAmount / total) * 100 : 0

    setIsMaterials(initMaterials)
    setAmountStr(initAmount.toFixed(2))
    setPercentStr(initPercent.toFixed(4))
  }, [open])

  // Percentage is always relative to total, regardless of isMaterials.
  // isMaterials only affects what the amount sources from when toggled ON.
  const handleMaterialsToggle = (checked: boolean) => {
    if (checked) {
      // When switching ON: seed amount from materialTotal at 100%
      const newAmount = materialTotal
      const newPercent = total > 0 ? (newAmount / total) * 100 : 0

      setAmountStr(newAmount.toFixed(2))
      setPercentStr(newPercent.toFixed(4))
    }

    setIsMaterials(checked)
  }

  const handleAmountChange = (value: string) => {
    setAmountStr(value)
    setIsMaterials(false)
    const num = parseFloat(value) || 0
    const newPercent = total > 0 ? (num / total) * 100 : 0

    setPercentStr(newPercent.toFixed(4))
  }

  const handlePercentChange = (value: string) => {
    setPercentStr(value)
    setIsMaterials(false)
    const num = parseFloat(value) || 0
    const newAmount = (num / 100) * total

    setAmountStr(newAmount.toFixed(2))
  }

  const handleSave = () => {
    onSave({
      isDownPaymentMaterials: isMaterials,
      downPaymentAmount: parseFloat(amountStr) || 0,
      downPaymentPercent: parseFloat(percentStr) || 0
    })
    onOpenChange(false)
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Payment Settings'
      maxWidth='sm'
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} className='flex-1'>
            Close
          </Button>
          <Button type='button' onClick={handleSave} className='flex-1'>
            Save
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        <div className='flex items-center gap-3'>
          <Label>Material Balance</Label>
          <Switch checked={isMaterials} onCheckedChange={handleMaterialsToggle} />
          <span className='text-sm text-muted-foreground'>{isMaterials ? 'YES' : 'NO'}</span>
        </div>
        {isMaterials && (
          <p className='text-xs text-muted-foreground'>
            Base: material items total — <span className='font-semibold'>${materialTotal.toFixed(2)}</span>
          </p>
        )}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label>Amount</Label>
            <Input
              type='number'
              min='0'
              step='0.01'
              value={amountStr}
              onChange={e => handleAmountChange(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <Label>Balance (%)</Label>
            <div className='relative'>
              <Input
                type='number'
                min='0'
                max='100'
                step='0.01'
                value={percentStr}
                onChange={e => handlePercentChange(e.target.value)}
                className='pr-8'
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>%</span>
            </div>
          </div>
        </div>
      </div>
    </CommonDialog>
  )
}

export default PaymentSettingModal
