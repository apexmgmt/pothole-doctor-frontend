import React from 'react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

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
    <div className='my-8 rounded-xl overflow-hidden '>
      <ScrollArea className='w-full whitespace-nowrap'>
        <table className='w-full border-collapse min-w-[600px]'>
          <thead className='bg-border/40 print:bg-gray-100 text-light print:text-black'>
            <tr className=''>
              <th className='px-4 py-3 text-left text-sm font-medium'>Item</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Description</th>
              <th className='px-4 py-3 text-right text-sm font-medium'>Amount</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border print:divide-gray-200'>
            {items.map((item, index) => (
              <tr key={index} className='hover:bg-gray-900 print:bg-white transition-colors'>
                <td className='px-4 py-8 text-sm text-light print:text-black align-top'>{item.name}</td>
                <td className='px-4 py-8 text-sm text-light/80 print:text-black/80 align-top max-w-md whitespace-normal'>
                  {item.description}
                </td>
                <td className='px-4 py-8 text-sm text-light print:text-black text-right align-top'>
                  ${item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <div className='flex justify-end border-t border-border p-6 bg-card'>
        <div className='w-full sm:max-w-[300px] space-y-4 bg-border print:bg-gray-100 p-4 rounded-md'>
          <div className='flex justify-between text-sm'>
            <span className='text-light/60 print:text-black/80'>Subtotal</span>
            <span className='text-light font-medium print:text-black'>${subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-light/60 print:text-black/80'>Tax (0%)</span>
            <span className='text-light font-medium print:text-black'>${tax.toFixed(2)}</span>
          </div>
          <Separator className='bg-accent' />
          <div className='flex justify-between text-lg font-semibold'>
            <span className='text-light print:text-black'>Total</span>
            <span className='text-light print:text-black'>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingItems
