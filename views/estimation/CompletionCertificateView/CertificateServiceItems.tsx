import React from 'react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ProposalService } from '@/types/estimates/proposals'

const CertificateServiceItems = ({ service }: { service: ProposalService }) => {
  return (
    <div className='my-4 rounded-xl overflow-hidden'>
      <ScrollArea className='w-full whitespace-nowrap'>
        <table className='w-full border-collapse min-w-[600px]'>
          <thead className='bg-[#f3f4f6] text-black'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium'>Item</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>Description</th>
              <th className='px-4 py-3 text-right text-sm font-medium'>Amount</th>
            </tr>
          </thead>
          {service?.items && service.items.length > 0 && (
            <tbody className='divide-y divide-[#e5e7eb]'>
              {service.service_type?.name && (
                <tr className='bg-[#f9fafb] transition-colors'>
                  <td className='px-4 py-2 text-sm font-semibold text-black align-top' colSpan={3}>
                    {service.service_type.name}
                  </td>
                </tr>
              )}
              {service.items.map((item, index) => (
                <tr key={index} className='transition-colors'>
                  <td className='px-4 py-2 text-sm text-black align-top'>{item?.name || ''}</td>
                  <td className='px-4 py-2 text-sm text-[rgba(0,0,0,0.8)] align-top max-w-md whitespace-normal'>
                    {item.description}
                  </td>
                  <td className='px-4 py-2 text-sm text-black text-right align-top'>${item.total_price}</td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <div className='flex justify-end'>
        <div className='w-full sm:max-w-[300px] space-y-4 bg-[#f3f4f6] p-4 rounded-md'>
          <div className='flex justify-between text-sm'>
            <span className='text-[rgba(0,0,0,0.8)]'>Material Sale</span>
            <span className='text-black font-medium'>${service?.material_sale ?? 0}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-[rgba(0,0,0,0.8)]'>Labor Sale</span>
            <span className='text-black font-medium'>${service?.labor_sale ?? 0}</span>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-[rgba(0,0,0,0.8)]'>Tax</span>
            <span className='text-black font-medium'>${service?.sale_tax ?? 0}</span>
          </div>
          <Separator className='bg-[#d1d5db]' />
          <div className='flex justify-between text-lg font-semibold'>
            <span className='text-black'>Total</span>
            <span className='text-black'>${service?.total_sale ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CertificateServiceItems
