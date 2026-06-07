'use client'

import { useEffect, useState } from 'react'
import CustomFormField from '@/components/form/CustomFormField'
import { Button } from '@/components/ui/button'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { formatCurrency } from '@/utils/currency'

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
    setAmountStr(Number(initAmount).toFixed(2))
    setPercentStr(Number(initPercent).toFixed(2))
  }, [open])

  // Percentage is always relative to total, regardless of isMaterials.
  // isMaterials only affects what the amount sources from when toggled ON.
  const handleMaterialsToggle = (checked: boolean) => {
    setIsMaterials(checked)

    let newAmount = checked ? Number(Number(materialTotal).toFixed(2)) : total
    let newPercent = total > 0 ? (newAmount / total) * 100 : 0

    if (newPercent > 100) {
      newPercent = 100
      newAmount = total
    }

    setAmountStr(Number(newAmount).toFixed(2))
    setPercentStr(Number(newPercent).toFixed(2))
  }

  const handleAmountChange = (value: string) => {
    let num = parseFloat(value) || 0

    if (total > 0 && num > total) {
      num = Number(Number(total).toFixed(2))
      value = num.toString()
    }

    setAmountStr(value)
    setIsMaterials(false)
    const newPercent = total > 0 ? (num / total) * 100 : 0

    setPercentStr(Number(newPercent).toFixed(2))
  }

  const handlePercentChange = (value: string) => {
    let num = parseFloat(value) || 0

    if (num > 100) {
      num = 100
      value = '100'
    }

    setPercentStr(value)
    setIsMaterials(false)
    const newAmount = (num / 100) * total

    setAmountStr(Number(newAmount).toFixed(2))
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
      maxWidth='xl'
      actions={
        <div className='flex gap-3'>
          <Button type='button' variant='outline' size='sm' onClick={() => onOpenChange(false)} className='flex-1'>
            Close
          </Button>
          <Button type='button' size='sm' onClick={handleSave} className='flex-1'>
            Save
          </Button>
        </div>
      }
    >
      <div className='space-y-2'>
          <CustomFormField 
          label='Material Balance' 
           type='switch' value={isMaterials} onChange={(val: any) => handleMaterialsToggle(val)} 
           className=''
           fieldClassName='grid grid-cols-[104px_minmax(0,1fr)] [&_button]:order-2 [&_label]:order-1'
              labelClassName='justify-end self-start text-right pt-1'
           />
        {isMaterials && (
          <p className='text-xs text-muted-foreground'>
            Base: material items total: <span className='font-semibold'>{formatCurrency(Number(materialTotal))}</span>
          </p>
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4'>
            <CustomFormField
              type='number'
              label='Amount'
              value={amountStr}
              onChange={(val: any) => handleAmountChange(val)}
              fieldClassName='grid grid-cols-[104px_minmax(0,_1fr)]'
              labelClassName='justify-end self-start text-right pt-1'
            />
              <CustomFormField
                type='number'
                label='Balance (%)'
                value={percentStr}
                onChange={(val: any) => handlePercentChange(val)}
                fieldClassName='grid grid-cols-[104px_minmax(0,_1fr)]'
                labelClassName='justify-end self-start text-right pt-1'
                rightAddon='%'
              />
        </div>
      </div>
    </CommonDialog>
  )
}

export default PaymentSettingModal
