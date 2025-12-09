import { EmailTemplate } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EditButton from '@/components/erp/common/buttons/EditButton'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EmailTemplateCardProps {
  template: EmailTemplate
  onEdit: (template: EmailTemplate) => void
}

export default function EmailTemplateCard({ template, onEdit }: EmailTemplateCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-lg'>{template.title}</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='h-5 w-5 text-accent-foreground cursor-help' />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Template Type: {template.type.toUpperCase()}</p>
                  <p>Subject: {template.subject}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div
          className='bg-muted p-4 rounded-md min-h-[100px]'
          dangerouslySetInnerHTML={{ __html: template.description }}
        />
        <div className='flex justify-center'>
          <EditButton
            title='Edit'
            onClick={() => onEdit(template)}
            variant='text'
            buttonSize='default'
            buttonVariant='outline'
            tooltip='Edit template'
          />
        </div>
      </CardContent>
    </Card>
  )
}
