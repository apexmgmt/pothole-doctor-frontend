import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { EditIcon } from 'lucide-react'

type EditButtonProps = {
  title?: string
  onClick?: () => void
  link?: string
  variant?: 'icon' | 'text'
  buttonSize?: 'icon' | 'default'
  buttonVariant?: 'outline' | 'ghost'
  tooltip?: string
}

export default function EditButton({
  title = 'Edit',
  onClick,
  link = '',
  variant = 'icon',
  buttonSize = 'icon',
  buttonVariant = 'outline',
  tooltip = ''
}: EditButtonProps) {
  const buttonContent = variant === 'icon' ? <EditIcon className='h-6 w-6' /> : <span>{title}</span>

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {link === '' ? (
            <Button variant={buttonVariant} size={buttonSize} onClick={onClick} type='button' aria-label={title}>
              {buttonContent}
            </Button>
          ) : (
            <Button variant={buttonVariant} size={buttonSize} aria-label={title} asChild>
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
