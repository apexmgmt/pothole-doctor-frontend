import Link from 'next/link'

import { CopyIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

type DuplicateButtonProps = {
  title?: string
  onClick?: () => void
  link?: string
  variant?: 'icon' | 'text'
  buttonSize?: 'icon' | 'default'
  buttonVariant?: 'outline' | 'ghost'
  tooltip?: string
}

export default function DuplicateButton({
  title = 'Duplicate',
  onClick,
  link = '',
  variant = 'icon',
  buttonSize = 'icon',
  buttonVariant = 'ghost',
  tooltip = ''
}: DuplicateButtonProps) {
  const buttonContent = variant === 'icon' ? <CopyIcon className='h-6 w-6' /> : <span>{title}</span>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {link === '' ? (
            <Button
              variant={buttonVariant}
              size={buttonSize}
              onClick={onClick}
              type='button'
              aria-label={title}
              className={`hover:text-dark hover:bg-white hover:border-white ${variant !== 'icon' ? 'w-full' : ''}`}
            >
              {buttonContent}
            </Button>
          ) : (
            <Button
              variant={buttonVariant}
              size={buttonSize}
              aria-label={title}
              asChild
              className={`hover:text-dark hover:bg-white hover:border-white ${variant !== 'icon' ? 'w-full' : ''}`}
            >
              <Link href={link}>{buttonContent}</Link>
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {tooltip || title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

