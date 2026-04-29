'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'

type PaymentMethod = 'ACH' | 'Card' | 'Cash' | 'Check' | 'None'

export interface CertificateChecklistPaymentHandle {
  getValues: () => {
    isSatisfied: boolean | null
    rating: string
    paymentMethod: PaymentMethod | null
    amountToCharge: string
    paymentMethodData: Record<string, any> | null
  }
}

interface Props {
  total: number
  readOnly?: boolean
  initialPaymentMethod?: string | null
  initialPaymentMethodData?: Record<string, any> | null
  initialAmountToCharge?: number | null
  initialIsSatisfied?: boolean | null
  initialRating?: number | null
}

const PAYMENT_METHODS: PaymentMethod[] = ['ACH', 'Card', 'Cash', 'Check', 'None']

const US_STATES = [
  'AL',
  'AK',
  'AZ',
  'AR',
  'CA',
  'CO',
  'CT',
  'DE',
  'FL',
  'GA',
  'HI',
  'ID',
  'IL',
  'IN',
  'IA',
  'KS',
  'KY',
  'LA',
  'ME',
  'MD',
  'MA',
  'MI',
  'MN',
  'MS',
  'MO',
  'MT',
  'NE',
  'NV',
  'NH',
  'NJ',
  'NM',
  'NY',
  'NC',
  'ND',
  'OH',
  'OK',
  'OR',
  'PA',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VT',
  'VA',
  'WA',
  'WV',
  'WI',
  'WY'
]

const inputCls = (ro: boolean) =>
  `w-full bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm${ro ? ' opacity-70 cursor-default' : ''}`

const selectCls = (ro: boolean) =>
  `bg-transparent border border-[#d1d5db] rounded px-2 py-1 text-sm outline-none${ro ? ' opacity-70 cursor-default' : ''}`

const CertificateChecklistPayment = forwardRef<CertificateChecklistPaymentHandle, Props>(
  (
    {
      total,
      readOnly = false,
      initialPaymentMethod,
      initialPaymentMethodData,
      initialAmountToCharge,
      initialIsSatisfied,
      initialRating
    },
    ref
  ) => {
    const [isSatisfied, setIsSatisfied] = useState<boolean | null>(initialIsSatisfied ?? null)
    const [rating, setRating] = useState(initialRating != null ? String(initialRating) : '')

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
      (initialPaymentMethod as PaymentMethod) ?? null
    )

    const [amountToCharge, setAmountToCharge] = useState(
      initialAmountToCharge != null ? String(initialAmountToCharge) : ''
    )

    // ACH fields
    const [achBankName, setAchBankName] = useState(initialPaymentMethodData?.bank_name ?? '')
    const [achBankState, setAchBankState] = useState(initialPaymentMethodData?.bank_state ?? '')
    const [achBankCity, setAchBankCity] = useState(initialPaymentMethodData?.bank_city ?? '')
    const [achZip, setAchZip] = useState(initialPaymentMethodData?.zip_code ?? '')
    const [achAccountNo, setAchAccountNo] = useState(initialPaymentMethodData?.account_no ?? '')
    const [achRoutingNo, setAchRoutingNo] = useState(initialPaymentMethodData?.routing_no ?? '')
    const [achAccountName, setAchAccountName] = useState(initialPaymentMethodData?.account_name ?? '')
    const [achAccountType, setAchAccountType] = useState(initialPaymentMethodData?.account_type ?? 'Checking')

    // Card fields
    const [cardName, setCardName] = useState(initialPaymentMethodData?.name_on_card ?? '')
    const [cardNumber, setCardNumber] = useState(initialPaymentMethodData?.card_number ?? '')
    const [cardExpMonth, setCardExpMonth] = useState(initialPaymentMethodData?.expiration_month ?? '')
    const [cardExpYear, setCardExpYear] = useState(initialPaymentMethodData?.expiration_year ?? '')
    const [cardCvv, setCardCvv] = useState(initialPaymentMethodData?.cvv ?? '')

    const [cardBillingSameAsHome, setCardBillingSameAsHome] = useState(
      initialPaymentMethodData?.billing_same_as_home === 'false' ? false : true
    )

    const [cardZip, setCardZip] = useState(initialPaymentMethodData?.zip_code ?? '')

    // Check fields
    const [checkNumber, setCheckNumber] = useState(initialPaymentMethodData?.check_number ?? '')

    const getPaymentMethodData = (): Record<string, any> | null => {
      switch (paymentMethod) {
        case 'ACH':
          return {
            bank_name: achBankName,
            bank_state: achBankState,
            bank_city: achBankCity,
            zip_code: achZip,
            account_no: achAccountNo,
            routing_no: achRoutingNo,
            account_name: achAccountName,
            account_type: achAccountType
          }
        case 'Card':
          return {
            name_on_card: cardName,
            card_number: cardNumber,
            expiration_month: cardExpMonth,
            expiration_year: cardExpYear,
            cvv: cardCvv,
            billing_same_as_home: String(cardBillingSameAsHome),
            zip_code: cardZip
          }
        case 'Check':
          return { check_number: checkNumber }
        default:
          return null
      }
    }

    useImperativeHandle(ref, () => ({
      getValues: () => ({
        isSatisfied,
        rating,
        paymentMethod,
        amountToCharge,
        paymentMethodData: getPaymentMethodData()
      })
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

            {/* ACH Form */}
            {paymentMethod === 'ACH' && (
              <div className='mt-4 grid grid-cols-2 gap-x-6 gap-y-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Bank Name:</label>
                  <input
                    type='text'
                    value={achBankName}
                    onChange={e => setAchBankName(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Bank State:</label>
                  <select
                    value={achBankState}
                    onChange={e => setAchBankState(e.target.value)}
                    disabled={readOnly}
                    className={selectCls(readOnly)}
                  >
                    <option value=''>Select State</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Bank City:</label>
                  <input
                    type='text'
                    value={achBankCity}
                    onChange={e => setAchBankCity(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>ZIP Code:</label>
                  <input
                    type='text'
                    value={achZip}
                    onChange={e => setAchZip(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Account No:</label>
                  <input
                    type='text'
                    value={achAccountNo}
                    onChange={e => setAchAccountNo(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Routing No:</label>
                  <input
                    type='text'
                    value={achRoutingNo}
                    onChange={e => setAchRoutingNo(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Account Name:</label>
                  <input
                    type='text'
                    value={achAccountName}
                    onChange={e => setAchAccountName(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Account Type:</label>
                  <select
                    value={achAccountType}
                    onChange={e => setAchAccountType(e.target.value)}
                    disabled={readOnly}
                    className={selectCls(readOnly)}
                  >
                    <option value='Checking'>Checking</option>
                    <option value='Savings'>Savings</option>
                  </select>
                </div>
              </div>
            )}

            {/* Card Form */}
            {paymentMethod === 'Card' && (
              <div className='mt-4 flex flex-col gap-3'>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Name on Card:</label>
                  <input
                    type='text'
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs text-gray-600'>Credit Card Number:</label>
                  <input
                    type='text'
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    readOnly={readOnly}
                    className={inputCls(readOnly)}
                  />
                </div>
                <div className='flex items-center gap-6'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-600'>Expiration:</span>
                    <input
                      type='text'
                      placeholder='MM'
                      value={cardExpMonth}
                      onChange={e => setCardExpMonth(e.target.value)}
                      readOnly={readOnly}
                      className={`w-12 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm text-center${readOnly ? ' opacity-70 cursor-default' : ''}`}
                    />
                    <span>/</span>
                    <input
                      type='text'
                      placeholder='YY'
                      value={cardExpYear}
                      onChange={e => setCardExpYear(e.target.value)}
                      readOnly={readOnly}
                      className={`w-12 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm text-center${readOnly ? ' opacity-70 cursor-default' : ''}`}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-600'>CVV:</span>
                    <input
                      type='text'
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      readOnly={readOnly}
                      className={`w-16 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm${readOnly ? ' opacity-70 cursor-default' : ''}`}
                    />
                  </div>
                </div>
                <label className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input
                    type='checkbox'
                    checked={cardBillingSameAsHome}
                    onChange={e => {
                      if (!readOnly) setCardBillingSameAsHome(e.target.checked)
                    }}
                    disabled={readOnly}
                    className='w-4 h-4'
                  />
                  <span className='text-xs text-gray-700'>Billing Address Same as Home Address</span>
                </label>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-600'>ZIP Code:</span>
                  <input
                    type='text'
                    value={cardZip}
                    onChange={e => setCardZip(e.target.value)}
                    readOnly={readOnly}
                    className={`w-24 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm${readOnly ? ' opacity-70 cursor-default' : ''}`}
                  />
                </div>
              </div>
            )}

            {/* Check Form */}
            {paymentMethod === 'Check' && (
              <div className='mt-4 flex items-center gap-2'>
                <span className='text-xs text-gray-600'>Check #:</span>
                <input
                  type='text'
                  value={checkNumber}
                  onChange={e => setCheckNumber(e.target.value)}
                  readOnly={readOnly}
                  className={`w-32 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm${readOnly ? ' opacity-70 cursor-default' : ''}`}
                />
              </div>
            )}

            {/* Amount to Charge */}
            <div className='flex items-end gap-2 mt-5'>
              <span className='font-semibold'>Amount to Charge:</span>
              {paymentMethod === 'None' ? (
                <span className='text-sm font-semibold'>$0</span>
              ) : (
                <input
                  type='text'
                  value={amountToCharge}
                  onChange={e => setAmountToCharge(e.target.value)}
                  readOnly={readOnly}
                  className={`w-32 bg-transparent border-b border-[rgba(0,0,0,0.4)] outline-none text-sm font-semibold ${readOnly ? 'opacity-70 cursor-default' : ''}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CertificateChecklistPayment.displayName = 'CertificateChecklistPayment'

export default CertificateChecklistPayment
