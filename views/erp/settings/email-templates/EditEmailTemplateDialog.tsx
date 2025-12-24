'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import { toast } from 'sonner'

import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor, Text } from 'slate'

import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor } from 'slate-react'

import { withHistory, HistoryEditor } from 'slate-history'

import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'

import { EmailTemplate, EmailTemplatePayload } from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import EmailTemplateService from '@/services/api/settings/email_templates.service'


interface EditEmailTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSuccess: () => void
}

type CustomElement = {
  type: string
  align?: string
  url?: string
  children: CustomText[]
}

type CustomText = {
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: CustomElement
    Text: CustomText
  }
}

const serialize = (nodes: Descendant[]): string => {
  return nodes.map(n => serializeNode(n)).join('')
}

const serializeNode = (node: any): string => {
  if (Text.isText(node)) {
    let text = node.text

    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    
return text
  }

  const children = node.children.map((n: any) => serializeNode(n)).join('')
  const alignStyle = node.align ? ` style="text-align: ${node.align};"` : ''

  switch (node.type) {
    case 'paragraph':
      return `<p${alignStyle}>${children}</p>`
    case 'heading-one':
      return `<h1${alignStyle}>${children}</h1>`
    case 'heading-two':
      return `<h2${alignStyle}>${children}</h2>`
    case 'heading-three':
      return `<h3${alignStyle}>${children}</h3>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${node.url}">${children}</a>`
    default:
      return children
  }
}

const deserialize = (html: string): Descendant[] => {
  // Handle plain text (no HTML tags at all)
  if (!html.includes('<') && !html.includes('>')) {
    const lines = html.split('\n').filter(line => line.trim() !== '')

    if (lines.length === 0) {
      return [{ type: 'paragraph', children: [{ text: '' }] }]
    }

    
return lines.map(line => ({
      type: 'paragraph',
      children: [{ text: line }]
    }))
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')

  const nodes = Array.from(doc.body.childNodes)
    .map(node => deserializeNode(node))
    .filter(Boolean) as Descendant[]

  return nodes.length > 0 ? nodes : [{ type: 'paragraph', children: [{ text: '' }] }]
}

const deserializeNode = (node: Node): any => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''


    // Wrap orphan text nodes in paragraphs
    if (text.trim() && node.parentNode?.nodeName === 'BODY') {
      return { type: 'paragraph', children: [{ text }] }
    }

    
return text.trim() ? { text } : null
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement

  // Handle inline formatting elements
  if (element.nodeName === 'STRONG' || element.nodeName === 'B') {
    const text = element.textContent || ''

    
return { text, bold: true }
  }

  if (element.nodeName === 'EM' || element.nodeName === 'I') {
    const text = element.textContent || ''

    
return { text, italic: true }
  }

  if (element.nodeName === 'U') {
    const text = element.textContent || ''

    
return { text, underline: true }
  }

  let children = Array.from(element.childNodes)
    .map(child => deserializeNode(child))
    .filter(Boolean)

  if (children.length === 0) {
    children = [{ text: '' }]
  }

  const align = element.style.textAlign || undefined

  switch (element.nodeName) {
    case 'P':
      return { type: 'paragraph', align, children }
    case 'H1':
      return { type: 'heading-one', align, children }
    case 'H2':
      return { type: 'heading-two', align, children }
    case 'H3':
      return { type: 'heading-three', align, children }
    case 'UL':
      return { type: 'bulleted-list', children }
    case 'OL':
      return { type: 'numbered-list', children }
    case 'LI':
      return { type: 'list-item', children }
    case 'A':
      return { type: 'link', url: element.getAttribute('href'), children }
    case 'BR':
      return { text: '\n' }
    case 'DIV':
      // Convert div to paragraph
      return { type: 'paragraph', align, children }
    case 'BODY':
      // Don't wrap body itself, just return its children
      return children.length === 1 ? children[0] : children
    default:
      // Wrap any unrecognized block elements in paragraph
      if (children.length === 1 && Text.isText(children[0])) {
        return { type: 'paragraph', children }
      }


      // If it contains only text, wrap in paragraph
      const hasOnlyText = children.every((child: any) => Text.isText(child))

      if (hasOnlyText) {
        return { type: 'paragraph', children }
      }

      
return children.length === 1 ? children[0] : { type: 'paragraph', children }
  }
}

const initialValue: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }]

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export default function EditEmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: EditEmailTemplateDialogProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const [key, setKey] = useState(0)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [key])

  useEffect(() => {
    if (template && open) {
      setTitle(template.title)

      try {
        const parsedValue = deserialize(template.description)

        setValue(parsedValue)
        setKey(prev => prev + 1)
      } catch (error) {
        console.error('Error parsing template:', error)
        setValue([{ type: 'paragraph', children: [{ text: template.description }] }])
        setKey(prev => prev + 1)
      }
    }
  }, [template?.id, open])

  const renderElement = useCallback((props: RenderElementProps) => {
    const style = { textAlign: (props.element as any).align }

    switch (props.element.type) {
      case 'heading-one':
        return (
          <h1 {...props.attributes} style={style} className='text-3xl font-bold'>
            {props.children}
          </h1>
        )
      case 'heading-two':
        return (
          <h2 {...props.attributes} style={style} className='text-2xl font-bold'>
            {props.children}
          </h2>
        )
      case 'heading-three':
        return (
          <h3 {...props.attributes} style={style} className='text-xl font-bold'>
            {props.children}
          </h3>
        )
      case 'bulleted-list':
        return (
          <ul {...props.attributes} className='list-disc list-inside'>
            {props.children}
          </ul>
        )
      case 'numbered-list':
        return (
          <ol {...props.attributes} className='list-decimal list-inside'>
            {props.children}
          </ol>
        )
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>
      case 'link':
        return (
          <a {...props.attributes} href={(props.element as any).url} className='text-blue-600 underline'>
            {props.children}
          </a>
        )
      default:
        return (
          <p {...props.attributes} style={style}>
            {props.children}
          </p>
        )
    }
  }, [])

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props

    if (props.leaf.bold) children = <strong>{children}</strong>
    if (props.leaf.italic) children = <em>{children}</em>
    if (props.leaf.underline) children = <u>{children}</u>
    
return <span {...props.attributes}>{children}</span>
  }, [])

  // To:
  const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor)

    
return marks ? marks[format] === true : false
  }

  // Also update the toggleMark function signature:
  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(editor, format)

    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type')
    const isList = LIST_TYPES.includes(format)

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        LIST_TYPES.includes(n.type as string) &&
        !TEXT_ALIGN_TYPES.includes(format),
      split: true
    })

    let newProperties: Partial<SlateElement>

    if (TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format
      } as Partial<SlateElement>
    } else {
      newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format
      } as Partial<SlateElement>
    }

    Transforms.setNodes<SlateElement>(editor, newProperties)

    if (!isActive && isList) {
      const block = { type: format, children: [] } as SlateElement

      Transforms.wrapNodes(editor, block)
    }
  }

  const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
    const { selection } = editor

    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any)[blockType] === format
      })
    )

    return !!match
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!template) return

    setIsLoading(true)

    try {
      const description = serialize(value)

      const payload: EmailTemplatePayload = {
        title,
        description
      }

      EmailTemplateService.update(template.id, payload)
        .then(response => {
          setIsLoading(false)
          toast.success('Email template updated successfully')
          onSuccess()
          onOpenChange(false)
        })
        .catch(error => {
          setIsLoading(false)
          toast.error('Failed to update email template')
        })
    } catch (error) {
      setIsLoading(false)
      toast.error('Failed to update email template')
    }
  }

  const placeholders = [
    { label: 'Customer Name', value: '{{CustomerName}}' },
    { label: 'Task Name', value: '{{TaskName}}' },
    { label: 'Date Time', value: '{{DateTime}}' },
    { label: 'Company Name', value: '{{CompanyName}}' },
    { label: 'Phone Number', value: '{{PhoneNumber}}' }
  ]

  const insertPlaceholder = (placeholder: string) => {
    Transforms.insertText(editor, ' ' + placeholder + ' ')
  }

  return (
    <CommonDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Edit Email Template'
      description='Update the email template content'
      maxWidth='4xl'
      isLoading={isLoading}
      actions={
        <>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='title'>
            Template Title <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder='Enter template title'
          />
        </div>

        <div className='space-y-2'>
          <Label>Available Placeholders</Label>
          <div className='flex flex-wrap gap-2'>
            {placeholders.map(placeholder => (
              <Button
                key={placeholder.value}
                type='button'
                variant='outline'
                size='sm'
                onClick={() => insertPlaceholder(placeholder.value)}
                className='text-xs'
              >
                {placeholder.label}
              </Button>
            ))}
          </div>
        </div>

        <div className='space-y-2'>
          <Label>
            Template Content <span className='text-destructive'>*</span>
          </Label>
          <div className='border rounded-md'>
            <div className='flex flex-wrap gap-1 p-2 border-b bg-muted'>
              {/* Text Formatting */}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleMark('bold')}
                className={isMarkActive(editor, 'bold') ? 'bg-accent' : ''}
              >
                <Bold className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleMark('italic')}
                className={isMarkActive(editor, 'italic') ? 'bg-accent' : ''}
              >
                <Italic className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleMark('underline')}
                className={isMarkActive(editor, 'underline') ? 'bg-accent' : ''}
              >
                <Underline className='h-4 w-4' />
              </Button>

              <div className='w-px h-6 bg-border mx-1' />

              {/* Headings */}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('heading-one')}
                className={isBlockActive(editor, 'heading-one') ? 'bg-accent' : ''}
              >
                <Heading1 className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('heading-two')}
                className={isBlockActive(editor, 'heading-two') ? 'bg-accent' : ''}
              >
                <Heading2 className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('heading-three')}
                className={isBlockActive(editor, 'heading-three') ? 'bg-accent' : ''}
              >
                <Heading3 className='h-4 w-4' />
              </Button>

              <div className='w-px h-6 bg-border mx-1' />

              {/* Lists */}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('bulleted-list')}
                className={isBlockActive(editor, 'bulleted-list') ? 'bg-accent' : ''}
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('numbered-list')}
                className={isBlockActive(editor, 'numbered-list') ? 'bg-accent' : ''}
              >
                <ListOrdered className='h-4 w-4' />
              </Button>

              <div className='w-px h-6 bg-border mx-1' />

              {/* Alignment */}
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('left')}
                className={isBlockActive(editor, 'left', 'align') ? 'bg-accent' : ''}
              >
                <AlignLeft className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('center')}
                className={isBlockActive(editor, 'center', 'align') ? 'bg-accent' : ''}
              >
                <AlignCenter className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('right')}
                className={isBlockActive(editor, 'right', 'align') ? 'bg-accent' : ''}
              >
                <AlignRight className='h-4 w-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => toggleBlock('justify')}
                className={isBlockActive(editor, 'justify', 'align') ? 'bg-accent' : ''}
              >
                <AlignJustify className='h-4 w-4' />
              </Button>
            </div>
            <Slate key={key} editor={editor} initialValue={value} onChange={setValue}>
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder='Enter template content...'
                className='min-h-[16rem] p-4'
              />
            </Slate>
          </div>
        </div>
      </form>
    </CommonDialog>
  )
}
