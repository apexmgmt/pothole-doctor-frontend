'use client'

import * as React from 'react'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-[#4D4D4D] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#f4f4f5] disabled:cursor-not-allowed disabled:opacity-50 bg-[#4D4D4D66] data-[state=checked]:bg-[#f4f4f5] data-[state=checked]:text-[#171717]',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('grid place-content-center text-current')}>
      <Check className='h-4 w-4' />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))

Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
