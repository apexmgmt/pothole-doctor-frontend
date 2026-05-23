import React from 'react'

import { EllipsisVertical } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

type ThreeDotButtonProps = {
  title?: string
  buttons: React.ReactNode[]
}

const ThreeDotButton: React.FC<ThreeDotButtonProps> = ({ title, buttons }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className='outline-none cursor-pointer text-[#A7A7AE] hover:text-white'>
        <EllipsisVertical className='size-5' />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {buttons.map((button, idx) => (
          <DropdownMenuItem key={idx} onClick={() => setIsOpen(false)} asChild>
            {button}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThreeDotButton
