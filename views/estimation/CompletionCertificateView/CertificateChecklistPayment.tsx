'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

type PaymentMethod = 'ACH' | 'Card' | 'Cash' | 'Check' | 'None'

export interface CertificateChecklistPaymentHandle {
  getValues: () => {
    isSatisfied: boolean | null
    rating: string
    paymentMethod: PaymentMethod | null
    amountToCharge: string
  }
}

interface Props {
  total: number
  readOnly?: boolean
  initialPaymentMethod?: string | null
  initialPaymentData?: Record<string, string> | null
}

const PAYMENT_METHODS: PaymentMethod[] = ['ACH', 'Card', 'Cash', 'Check', 'None']

const CertificateChecklistPayment = forwardRef<CertificateChecklistPaymentHandle, Props>(
  ({ total, readOnly = false, initialPaymentMethod, initialPaymentData }, ref) => {
    const [isSatisfied, setIsSatisfied] = useState<boolean | null>(
      initialPaymentData?.is_satisfied != null ? initialPaymentData.is_satisfied === 'true' : null
    )

    const [rating, setRating] = useState(initialPaymentData?.rating ?? '')

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
      (initialPaymentMethod as PaymentMethod) ?? null
    )

    const [amountToCharge, setAmountToCharge] = useState(initialPaymentData?.amount_to_charge ?? '')

    useImperativeHandle(ref, () => ({
      getValues: () => ({ isSatisfied, rating, paymentMethod, amountToCharge })
    }))

    const toggleSatisfied = (value: boolean) => {
      if (readOnly) return
      setIsSatisfied(prev => (prev === value ? null : value))
    }

    const togglePaymentMethod = (method: PaymentMethod) => {
      if (readOnly) return
      setPaymentMethod(prev => (prev === method ? null : method))
    }

    return (
      <div className='my-4 text-sm text-black'>
        <h3 className='text-base font-semibold mb-4 bg-[#f3f4f6] px-3 py-2 rounded'>
          Customer Checklist and Payment Information
        </h3>

        {/* Customer Checklist */}
        <div className='mb-5'>
          <p className='font-semibold mb-2'>Customer Checklist:</p>
          <div className='rounded-md overflow-hidden border border-[#d1d5db]'>
            <table className='w-full border-separate border-spacing-0'>
              <thead>
                <tr className='bg-[#f3f4f6]'>
                  <th className='border-b border-r border-[#d1d5db] px-3 py-2 text-left text-sm font-medium w-2/3'>
                    Checklist Item
                  </th>
                  <th className='border-b border-[#d1d5db] px-3 py-2 text-left text-sm font-medium' />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='border-b border-r border-[#d1d5db] px-3 py-2 text-sm text-[#1e40af]'>
                    Are you satisfied with the quality of work we performed?
                  </td>
                  <td className='border-b border-[#d1d5db] px-3 py-2'>
                    <div className='flex items-center gap-4'>
                      <label className={`flex items-center gap-1 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                        <input
                          type='checkbox'
                          checked={isSatisfied === true}
                          onChange={() => toggleSatisfied(true)}
                          disabled={readOnly}
                          className='w-4 h-4'
                        />
                        <span>YES</span>
                      </label>
                      <label className={`flex items-center gap-1 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                        <input
                          type='checkbox'
                          checked={isSatisfied === false}
                          onChange={() => toggleSatisfied(false)}
                          disabled={readOnly}
                          className='w-4 h-4'
                        />
                        <span>NO</span>
                      </label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className='border-r border-[#d1d5db] px-3 py-2 text-sm text-[#1e40af]'>
                    How would you rate your installation on a scale of 1-10?
                  </td>
                  <td className='border-[#d1d5db] px-3 py-2'>
                    <input
                      type='text'
                      value={rating}
                      onChange={e => setRating(e.target.value)}
                      readOnly={readOnly}
                      className={`w-24 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Balance Amount */}
        <div className='mb-5'>
          <p className='font-semibold text-sm'>Invoice Balance Amount:</p>
          <p className='text-2xl font-bold mt-1'>${Number(total ?? 0).toFixed(2)}</p>
        </div>

        {/* Payment Method */}
        <div className='mb-2'>
          <p className='font-semibold mb-2'>Payment Method:</p>
          <div className='border border-[#d1d5db] rounded p-4 bg-[#f9fafb]'>
            <div className='flex items-center gap-4 flex-wrap'>
              {PAYMENT_METHODS.map(m => (
                <label key={m} className={`flex items-center gap-1 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input
                    type='checkbox'
                    checked={paymentMethod === m}
                    onChange={() => togglePaymentMethod(m)}
                    disabled={readOnly}
                    className='w-4 h-4'
                  />
                  <span>{m}</span>
                </label>
              ))}
            </div>

            {/* Amount to Charge */}
            <div className='flex items-end gap-2 mt-5'>
              <span className='font-semibold'>Amount to Charge:</span>
              <input
                type='text'
                value={amountToCharge}
                onChange={e => setAmountToCharge(e.target.value)}
                readOnly={readOnly}
                className={`w-32 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm font-semibold ${readOnly ? 'opacity-70 cursor-default' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CertificateChecklistPayment.displayName = 'CertificateChecklistPayment'

export default CertificateChecklistPayment
