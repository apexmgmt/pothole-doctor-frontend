'use client'

import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

type PaymentMethod = 'ach' | 'in-store' | 'card' | 'check'

export interface InvoicePaymentMethodHandle {
  getSelectedMethod: () => string | null
  getFieldEntries: () => { label: string; value: string }[]
}

/** Maps backend enum values back to internal keys */
const REVERSE_METHOD_MAP: Record<string, PaymentMethod> = {
  ACH: 'ach',
  'In-Store Payment': 'in-store',
  Card: 'card',
  Check: 'check'
}

const inputCls =
  'flex-1 min-w-[100px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.4)] rounded-none outline-none focus:ring-0 focus:border-[rgba(0,0,0,0.8)] text-sm text-black px-0 pb-0.5 h-6'

const readOnlyCls = 'opacity-70 cursor-default select-text'

const UnderlineField = ({
  label,
  wide,
  defaultValue,
  readOnly
}: {
  label: string
  wide?: boolean
  defaultValue?: string
  readOnly?: boolean
}) => (
  <div className={`flex items-end gap-2 ${wide ? 'col-span-2' : ''}`}>
    <span className='text-sm text-[rgba(0,0,0,0.8)] whitespace-nowrap shrink-0'>{label}</span>
    <input defaultValue={defaultValue} readOnly={readOnly} className={`${inputCls} ${readOnly ? readOnlyCls : ''}`} />
  </div>
)

const InvoicePaymentMethod = forwardRef<
  InvoicePaymentMethodHandle,
  {
    total: number
    onMethodChange: (method: PaymentMethod | null) => void
    readOnly?: boolean
    initialMethod?: string | null
    initialData?: Record<string, string> | null
  }
>(({ total, onMethodChange, readOnly = false, initialMethod = null, initialData = null }, ref) => {
  const resolvedInitial: PaymentMethod | null = initialMethod ? (REVERSE_METHOD_MAP[initialMethod] ?? null) : null

  const [method, setMethod] = useState<PaymentMethod | null>(resolvedInitial)
  const fieldsContainerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    getSelectedMethod: () => method,
    getFieldEntries: () => {
      const container = fieldsContainerRef.current

      if (!container || !method) return []
      const entries: { label: string; value: string }[] = []

      container.querySelectorAll<HTMLElement>('.flex.items-end.gap-2').forEach(wrapper => {
        const span = wrapper.querySelector('span')
        const input = wrapper.querySelector<HTMLInputElement>('input:not([type="checkbox"])')

        if (span && input) {
          entries.push({ label: span.textContent?.replace(/:$/, '').trim() ?? '', value: input.value })
        }
      })

      return entries
    }
  }))

  const toggle = (m: PaymentMethod) => {
    if (readOnly) return
    const next = method === m ? null : m

    setMethod(next)
    onMethodChange(next)
  }

  return (
    <div className='my-6 text-sm print:text-black'>
      <h3 className='text-base font-semibold mb-4 bg-[#f3f4f6] px-3 py-2 rounded'>Payment Method</h3>

      {/* Method selector */}
      <div className='flex flex-wrap gap-6 mb-5'>
        {(['ach', 'in-store', 'card', 'check'] as PaymentMethod[]).map(m => (
          <label
            key={m}
            className={`flex items-center gap-2 select-none print:cursor-default ${readOnly ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
          >
            <input
              type='checkbox'
              checked={method === m}
              onChange={() => toggle(m)}
              disabled={readOnly}
              className='w-4 h-4 accent-[#3ecf6d] print:appearance-auto'
            />
            <span className='text-sm text-black capitalize'>
              {m === 'ach' ? 'ACH' : m === 'in-store' ? 'In-Store Payment' : m === 'check' ? 'Check' : 'Card'}
            </span>
          </label>
        ))}
      </div>

      {/* Fields container — queried by getFieldEntries() */}
      <div ref={fieldsContainerRef}>
        {/* ACH */}
        {method === 'ach' && (
          <div className='grid grid-cols-2 gap-x-10 gap-y-4'>
            <UnderlineField label='Bank Name:' readOnly={readOnly} defaultValue={initialData?.['Bank Name']} />
            <UnderlineField label='Bank State:' readOnly={readOnly} defaultValue={initialData?.['Bank State']} />
            <UnderlineField label='Bank City:' readOnly={readOnly} defaultValue={initialData?.['Bank City']} />
            <UnderlineField label='ZIP Code:' readOnly={readOnly} defaultValue={initialData?.['ZIP Code']} />
            <UnderlineField label='Account No:' readOnly={readOnly} defaultValue={initialData?.['Account No']} />
            <UnderlineField label='Routing No:' readOnly={readOnly} defaultValue={initialData?.['Routing No']} />
            <UnderlineField label='Account Name:' readOnly={readOnly} defaultValue={initialData?.['Account Name']} />
            <UnderlineField label='Account Type:' readOnly={readOnly} defaultValue={initialData?.['Account Type']} />
            <UnderlineField
              label='A/C Holding Type:'
              readOnly={readOnly}
              defaultValue={initialData?.['A/C Holding Type']}
            />
          </div>
        )}

        {/* Card */}
        {method === 'card' && (
          <div className='space-y-4'>
            <div className='flex items-end gap-2'>
              <span className='text-sm font-semibold text-black'>Amount Due:</span>
              <input
                defaultValue={`$${total}`}
                readOnly={readOnly}
                className={`${inputCls} max-w-[200px] font-semibold ${readOnly ? readOnlyCls : ''}`}
              />
            </div>

            <h4 className='font-semibold text-sm mt-4 text-black'>Credit Card Information</h4>
            <div className='space-y-4'>
              <UnderlineField label='Name on Card:' readOnly={readOnly} defaultValue={initialData?.['Name on Card']} />
              <UnderlineField
                label='Credit Card Number:'
                readOnly={readOnly}
                defaultValue={initialData?.['Credit Card Number']}
              />
              <div className='flex items-end gap-6'>
                <div className='flex items-end gap-2'>
                  <span className='text-sm text-[rgba(0,0,0,0.8)]'>Expiration:</span>
                  <input
                    placeholder='MM'
                    readOnly={readOnly}
                    className={`${inputCls} w-10 min-w-0 text-center ${readOnly ? readOnlyCls : ''}`}
                    maxLength={2}
                    defaultValue={initialData?.['Expiration MM']}
                  />
                  <span className='text-[rgba(0,0,0,0.4)]'>/</span>
                  <input
                    placeholder='YY'
                    readOnly={readOnly}
                    className={`${inputCls} w-10 min-w-0 text-center ${readOnly ? readOnlyCls : ''}`}
                    maxLength={2}
                    defaultValue={initialData?.['Expiration YY']}
                  />
                </div>
                <UnderlineField label='CVV:' readOnly={readOnly} defaultValue={initialData?.['CVV']} />
              </div>
              <label className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input type='checkbox' disabled={readOnly} className='w-4 h-4 accent-[#3ecf6d] print:appearance-auto' />
                <span className='text-sm text-black'>Billing Address same as Home Address</span>
              </label>
              <div className='grid grid-cols-2 gap-x-10 gap-y-4'>
                <UnderlineField
                  label='Street Address:'
                  readOnly={readOnly}
                  defaultValue={initialData?.['Street Address']}
                />
                <div />
                <UnderlineField label='City:' readOnly={readOnly} defaultValue={initialData?.['City']} />
                <UnderlineField label='State:' readOnly={readOnly} defaultValue={initialData?.['State']} />
                <UnderlineField label='ZIP Code:' readOnly={readOnly} defaultValue={initialData?.['ZIP Code']} />
              </div>
            </div>
          </div>
        )}

        {/* Check */}
        {method === 'check' && (
          <div className='space-y-4'>
            <UnderlineField label='Check #:' readOnly={readOnly} defaultValue={initialData?.['Check #']} />
          </div>
        )}

        {/* Amount Due — shown for all except card (card shows it inline above) */}
        {method && method !== 'card' && (
          <div className='flex items-end gap-2 mt-5'>
            <span className='text-sm font-semibold text-black'>Amount Due:</span>
            <input
              defaultValue={`$${total}`}
              readOnly={readOnly}
              className={`${inputCls} max-w-[200px] font-semibold ${readOnly ? readOnlyCls : ''}`}
            />
          </div>
        )}
      </div>
    </div>
  )
})

InvoicePaymentMethod.displayName = 'InvoicePaymentMethod'

export default InvoicePaymentMethod
