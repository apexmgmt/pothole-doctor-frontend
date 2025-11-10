import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { EditIcon } from 'lucide-react'

type EditButtonProps = {
  title?: string
  onClick?: () => void
  link?: string
}

export default function EditButton({ title = 'Edit', onClick, link = '' }: EditButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {link === '' ? (
            <Button variant='ghost' size='icon' onClick={onClick} type='button' aria-label={title}>
              <EditIcon />
            </Button>
          ) : (
            <Link href={link} passHref>
              <Button asChild variant='ghost' size='icon' aria-label={title} tabIndex={0}>
                <EditIcon className='h-6 w-6' />
              </Button>
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {title}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
