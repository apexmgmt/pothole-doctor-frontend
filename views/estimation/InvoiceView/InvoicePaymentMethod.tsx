'use client'

import { useState } from 'react'

type PaymentMethod = 'ach' | 'in-store' | 'card' | 'check'

const inputCls =
  'flex-1 min-w-[100px] bg-transparent border-0 border-b border-primary-foreground/40 print:border-black/40 rounded-none outline-none focus:ring-0 focus:border-primary-foreground/80 text-sm text-primary-foreground print:text-black px-0 pb-0.5 h-6'

const UnderlineField = ({ label, wide, defaultValue }: { label: string; wide?: boolean; defaultValue?: string }) => (
  <div className={`flex items-end gap-2 ${wide ? 'col-span-2' : ''}`}>
    <span className='text-sm text-primary-foreground/80 print:text-black/80 whitespace-nowrap shrink-0'>{label}</span>
    <input defaultValue={defaultValue} className={inputCls} />
  </div>
)

const InvoicePaymentMethod = ({ total }: { total: number }) => {
  const [method, setMethod] = useState<PaymentMethod | null>(null)

  const toggle = (m: PaymentMethod) => setMethod(prev => (prev === m ? null : m))

  return (
    <div className='my-6 text-sm print:text-black'>
      <h3 className='text-base font-semibold mb-4 bg-border/40 print:bg-gray-100 px-3 py-2 rounded'>Payment Method</h3>

      {/* Method selector */}
      <div className='flex flex-wrap gap-6 mb-5'>
        {(['ach', 'in-store', 'card', 'check'] as PaymentMethod[]).map(m => (
          <label key={m} className='flex items-center gap-2 cursor-pointer select-none print:cursor-default'>
            <input
              type='checkbox'
              checked={method === m}
              onChange={() => toggle(m)}
              className='w-4 h-4 accent-primary print:appearance-auto'
            />
            <span className='text-sm text-primary-foreground print:text-black capitalize'>
              {m === 'ach' ? 'ACH' : m === 'in-store' ? 'In-Store Payment' : m === 'check' ? 'Check' : 'Card'}
            </span>
          </label>
        ))}
      </div>

      {/* ACH */}
      {method === 'ach' && (
        <div className='grid grid-cols-2 gap-x-10 gap-y-4'>
          <UnderlineField label='Bank Name:' />
          <UnderlineField label='Bank State:' />
          <UnderlineField label='Bank City:' />
          <UnderlineField label='ZIP Code:' />
          <UnderlineField label='Account No:' />
          <UnderlineField label='Routing No:' />
          <UnderlineField label='Account Name:' />
          <UnderlineField label='Account Type:' />
          <UnderlineField label='A/C Holding Type:' />
        </div>
      )}

      {/* Card */}
      {method === 'card' && (
        <div className='space-y-4'>
          <div className='flex items-end gap-2'>
            <span className='text-sm font-semibold text-primary-foreground print:text-black'>Amount Due:</span>
            <input defaultValue={`$${total}`} className={`${inputCls} max-w-[200px] font-semibold`} />
          </div>

          <h4 className='font-semibold text-sm mt-4 text-primary-foreground print:text-black'>
            Credit Card Information
          </h4>
          <div className='space-y-4'>
            <UnderlineField label='Name on Card:' />
            <UnderlineField label='Credit Card Number:' />
            <div className='flex items-end gap-6'>
              <div className='flex items-end gap-2'>
                <span className='text-sm text-primary-foreground/80 print:text-black/80'>Expiration:</span>
                <input placeholder='MM' className={`${inputCls} w-10 min-w-0 text-center`} maxLength={2} />
                <span className='text-primary-foreground/40 print:text-black/40'>/</span>
                <input placeholder='YY' className={`${inputCls} w-10 min-w-0 text-center`} maxLength={2} />
              </div>
              <UnderlineField label='CVV:' />
            </div>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input type='checkbox' className='w-4 h-4 accent-primary print:appearance-auto' />
              <span className='text-sm text-primary-foreground print:text-black'>
                Billing Address same as Home Address
              </span>
            </label>
            <div className='grid grid-cols-2 gap-x-10 gap-y-4'>
              <UnderlineField label='Street Address:' />
              <div />
              <UnderlineField label='City:' />
              <UnderlineField label='State:' />
              <UnderlineField label='ZIP Code:' />
            </div>
          </div>
        </div>
      )}

      {/* Check */}
      {method === 'check' && (
        <div className='space-y-4'>
          <UnderlineField label='Check #:' />
        </div>
      )}

      {/* Amount Due — shown for all except card (card shows it inline above) */}
      {method && method !== 'card' && (
        <div className='flex items-end gap-2 mt-5'>
          <span className='text-sm font-semibold text-primary-foreground print:text-black'>Amount Due:</span>
          <input defaultValue={`$${total}`} className={`${inputCls} max-w-[200px] font-semibold`} />
        </div>
      )}
    </div>
  )
}

export default InvoicePaymentMethod
