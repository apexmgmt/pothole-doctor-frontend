import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

type ThreeDotButtonProps = {
  title?: string
  buttons: React.ReactNode[]
}

const ThreeDotButton: React.FC<ThreeDotButtonProps> = ({ title, buttons }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='outline-none cursor-pointer text-[#A7A7AE] hover:text-white'>
        <EllipsisVertical className='size-6' />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {buttons.map((button, idx) => (
          <DropdownMenuItem key={idx} asChild>
            {button}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThreeDotButton
