'use client'

import { EmailTemplate, EmailTemplatePayload } from '@/types'
import CommonDialog from '@/components/erp/common/dialogs/CommonDialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState, useEffect, useMemo, useCallback } from 'react'
import EmailTemplateService from '@/services/api/settings/email_templates.service'
import { toast } from 'sonner'
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor } from 'slate'
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
  if (node.text !== undefined) {
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
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return Array.from(doc.body.childNodes)
    .map(node => deserializeNode(node))
    .filter(Boolean) as Descendant[]
}

const deserializeNode = (node: Node): any => {
  if (node.nodeType === Node.TEXT_NODE) {
    return { text: node.textContent || '' }
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement
  const children = Array.from(element.childNodes)
    .map(child => deserializeNode(child))
    .filter(Boolean)

  if (children.length === 0) {
    children.push({ text: '' })
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
    case 'STRONG':
    case 'B':
      return { text: element.textContent || '', bold: true }
    case 'EM':
    case 'I':
      return { text: element.textContent || '', italic: true }
    case 'U':
      return { text: element.textContent || '', underline: true }
    case 'A':
      return { type: 'link', url: element.getAttribute('href'), children }
    case 'BR':
      return { text: '\n' }
    default:
      return { type: 'paragraph', children }
  }
}

export default function EditEmailTemplateDialog({
  open,
  onOpenChange,
  template,
  onSuccess
}: EditEmailTemplateDialogProps) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [value, setValue] = useState<Descendant[]>([{ type: 'paragraph', children: [{ text: '' }] }])

  useEffect(() => {
    if (template && open) {
      setTitle(template.title)
      try {
        const parsedValue = deserialize(template.description)
        setValue(parsedValue.length > 0 ? parsedValue : [{ type: 'paragraph', children: [{ text: '' }] }])
      } catch (error) {
        console.error('Error parsing template:', error)
        setValue([{ type: 'paragraph', children: [{ text: template.description }] }])
      }
    }
  }, [template, open])

  const renderElement = useCallback((props: RenderElementProps) => {
    const style = { textAlign: (props.element as any).align }
    switch (props.element.type) {
      case 'heading-one':
        return (
          <h1 {...props.attributes} style={style}>
            {props.children}
          </h1>
        )
      case 'heading-two':
        return (
          <h2 {...props.attributes} style={style}>
            {props.children}
          </h2>
        )
      case 'heading-three':
        return (
          <h3 {...props.attributes} style={style}>
            {props.children}
          </h3>
        )
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>
      case 'link':
        return (
          <a {...props.attributes} href={(props.element as any).url}>
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

  const toggleMark = (format: string) => {
    const isActive = isMarkActive(editor, format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
    }
  }

  const isMarkActive = (editor: Editor, format: string) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  const toggleBlock = (format: string) => {
    const isActive = isBlockActive(editor, format)
    const isList = format === 'bulleted-list' || format === 'numbered-list'

    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
      split: true
    })

    const newProperties: Partial<SlateElement> = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format
    } as Partial<SlateElement>

    Transforms.setNodes<SlateElement>(editor, newProperties)

    if (!isActive && isList) {
      const block = { type: format, children: [] }
      Transforms.wrapNodes(editor, block)
    }
  }

  const isBlockActive = (editor: Editor, format: string) => {
    const { selection } = editor
    if (!selection) return false

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format
      })
    )

    return !!match
  }

  const toggleAlign = (align: string) => {
    Transforms.setNodes(editor, { align } as Partial<SlateElement>, {
      match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
    })
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

      await EmailTemplateService.update(template.id, payload)
      toast.success('Email template updated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to update email template')
      console.error(error)
    } finally {
      setIsLoading(false)
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
              <Button type='button' variant='ghost' size='sm' onClick={() => toggleAlign('left')}>
                <AlignLeft className='h-4 w-4' />
              </Button>
              <Button type='button' variant='ghost' size='sm' onClick={() => toggleAlign('center')}>
                <AlignCenter className='h-4 w-4' />
              </Button>
              <Button type='button' variant='ghost' size='sm' onClick={() => toggleAlign('right')}>
                <AlignRight className='h-4 w-4' />
              </Button>
              <Button type='button' variant='ghost' size='sm' onClick={() => toggleAlign('justify')}>
                <AlignJustify className='h-4 w-4' />
              </Button>
            </div>
            <Slate editor={editor} initialValue={value} onChange={setValue}>
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
