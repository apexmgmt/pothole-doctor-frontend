import React from 'react'
import { Separator } from '@/components/ui/separator'

const BillingItems = () => {
  const items = [
    {
      name: 'Industrial metallic coating',
      description: 'Delivering impactful billboard campaigns with Rd, Lucasville.',
      amount: 500.0
    },
    {
      name: 'Industrial metallic coating',
      description: 'Delivering impactful billboard campaigns with Rd, Lucasville.',
      amount: 2300.0
    }
  ]

  const subtotal = 2800.0
  const tax = 0.0
  const total = 2800.0

  return (
    <div className='my-8 rounded-lg overflow-hidden'>
      <table className='w-full border-collapse'>
        <thead className='bg-border/40'>
          <tr className=''>
            <th className='px-4 py-3 text-left text-sm font-medium text-light'>Item</th>
            <th className='px-4 py-3 text-left text-sm font-medium text-light'>Description</th>
            <th className='px-4 py-3 text-right text-sm font-medium text-light'>Amount</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {items.map((item, index) => (
            <tr key={index} className='hover:bg-gray-900 transition-colors'>
              <td className='px-4 py-8 text-sm text-light align-top'>{item.name}</td>
              <td className='px-4 py-8 text-sm text-light/80 align-top max-w-md'>{item.description}</td>
              <td className='px-4 py-8 text-sm text-light text-right align-top'>${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='flex justify-end'>
        <div className='w-full max-w-[300px] space-y-4 bg-border p-4 rounded-md'>
          <div className='flex justify-between text-sm'>
            <span className='text-light/60'>Subtotal</span>
            <span className='text-light font-medium'>${subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-light/60'>Tax (0%)</span>
            <span className='text-light font-medium'>${tax.toFixed(2)}</span>
          </div>
          <Separator className='bg-border' />
          <div className='flex justify-between text-lg font-semibold'>
            <span className='text-light'>Total</span>
            <span className='text-light'>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingItems
