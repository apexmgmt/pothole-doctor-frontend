'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'sonner'

import { Info } from 'lucide-react'

import { EmailTemplate } from '@/types'
import EmailTemplateCard from './EmailTemplateCard'
import EditEmailTemplateDialog from './EditEmailTemplateDialog'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'



export default function EmailTemplates({ templates: initialTemplates }: { templates: EmailTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()

  // Sync state with props when initialTemplates changes
  useEffect(() => {
    setTemplates(initialTemplates)
  }, [initialTemplates])

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setIsEditDialogOpen(true)
  }

  const handleSuccess = () => {
    // Refresh server-side data
    router.refresh()
  }

  // Group templates by group type
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      if (!acc[template.group]) {
        acc[template.group] = []
      }

      acc[template.group].push(template)
      
return acc
    },
    {} as Record<string, EmailTemplate[]>
  )

  const groups = Object.keys(groupedTemplates)

  return (
    <>
      <div className='grid grid-cols-1 lg:grid-cols-2'>
        <Tabs defaultValue={groups[0]} className='w-full'>
          <TabsList className='grid w-full' style={{ gridTemplateColumns: `repeat(${groups.length}, 1fr)` }}>
            {groups.map(group => (
              <TabsTrigger key={group} value={group} className='capitalize'>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>

          {groups.map(group => (
            <TabsContent key={group} value={group} className='space-y-4 mt-4'>
              <Accordion
                type='multiple'
                className='w-full space-y-4'
                defaultValue={groupedTemplates[group].map(t => t.id)}
              >
                {groupedTemplates[group]
                  .filter(t => t.type === 'email')
                  .map(template => (
                    <AccordionItem key={template.id} value={template.id} className='border rounded-lg'>
                      <AccordionTrigger className='px-6 hover:no-underline'>
                        <div className='flex items-center gap-2'>
                          <Info className='h-5 w-5 text-accent-foreground' />
                          <span className='text-lg font-semibold'>{template.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 pb-4'>
                        <EmailTemplateCard template={template} onEdit={handleEdit} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}

                {groupedTemplates[group]
                  .filter(t => t.type === 'sms')
                  .map(template => (
                    <AccordionItem key={template.id} value={template.id} className='border rounded-lg'>
                      <AccordionTrigger className='px-6 hover:no-underline'>
                        <div className='flex items-center gap-2'>
                          <Info className='h-5 w-5 text-accent-foreground' />
                          <span className='text-lg font-semibold'>{template.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 pb-4'>
                        <EmailTemplateCard template={template} onEdit={handleEdit} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <EditEmailTemplateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        template={selectedTemplate}
        onSuccess={handleSuccess}
      />
    </>
  )
}
