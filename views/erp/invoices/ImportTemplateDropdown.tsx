import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ServiceTemplate } from '@/types'

interface ImportTemplateDropdownProps {
  serviceTemplates?: ServiceTemplate[]
  onSelect: (template: ServiceTemplate) => void
}

const ImportTemplateDropdown = ({ serviceTemplates = [], onSelect }: ImportTemplateDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type='button' variant='outline'>
          Import Template
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='start'>
        {serviceTemplates.map(template => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onSelect(template)}
            className='cursor-pointer'
          >
            {template.title} ({template.service_type?.name})
          </DropdownMenuItem>
        ))}
        {!serviceTemplates.length && (
          <DropdownMenuItem disabled>No templates available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ImportTemplateDropdown
