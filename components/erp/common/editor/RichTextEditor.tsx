import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement, BaseEditor, Text } from 'slate'
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, ReactEditor } from 'slate-react'
import { withHistory, HistoryEditor } from 'slate-history'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const serializeToHtml = (nodes: Descendant[]): string => {
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
    case 'heading-four':
      return `<h4${alignStyle}>${children}</h4>`
    case 'heading-five':
      return `<h5${alignStyle}>${children}</h5>`
    case 'heading-six':
      return `<h6${alignStyle}>${children}</h6>`
    case 'block-quote':
      return `<blockquote${alignStyle}>${children}</blockquote>`
    case 'bulleted-list':
      return `<ul>${children}</ul>`
    case 'numbered-list':
      return `<ol>${children}</ol>`
    case 'list-item':
      return `<li>${children}</li>`
    case 'link':
      return `<a href="${node.url}">${children}</a>`
    case 'image':
      return `<img src="${node.url}" alt="${children}" />`
    default:
      return children
  }
}

export const deserializeFromHtml = (html: string): Descendant[] => {
  if (!html || (!html.includes('<') && !html.includes('>'))) {
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
    if (text.trim() && node.parentNode?.nodeName === 'BODY') {
      return { type: 'paragraph', children: [{ text }] }
    }
    return text.trim() ? { text } : null
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement

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
    case 'H4':
      return { type: 'heading-four', align, children }
    case 'H5':
      return { type: 'heading-five', align, children }
    case 'H6':
      return { type: 'heading-six', align, children }
    case 'UL':
      return { type: 'bulleted-list', children }
    case 'OL':
      return { type: 'numbered-list', children }
    case 'LI':
      return { type: 'list-item', children }
    case 'A':
      return { type: 'link', url: element.getAttribute('href'), children }
    case 'IMG':
      return { type: 'image', url: element.getAttribute('src'), children: [{ text: '' }] }
    case 'BLOCKQUOTE':
      return { type: 'block-quote', align, children }
    case 'BR':
      return { text: '\n' }
    case 'DIV':
    case 'BODY':
      return children
    default:
      const hasOnlyText = children.every((child: any) => Text.isText(child))
      if (hasOnlyText) {
        return { type: 'paragraph', children }
      }
      return children.length === 1 ? children[0] : { type: 'paragraph', children }
  }
}

const withImages = (editor: Editor) => {
  const { isVoid } = editor
  editor.isVoid = element => (element.type === 'image' ? true : isVoid(element))
  return editor
}

interface RichTextEditorProps {
  value: Descendant[]
  onChange: (value: Descendant[]) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type here...',
  className = '',
  minHeight = '12rem'
}) => {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), [])

  const renderElement = useCallback((props: RenderElementProps) => {
    const style = { textAlign: (props.element as any).align }
    switch (props.element.type) {
      case 'heading-one':
        return (
          <h1 {...props.attributes} style={style} className='text-4xl font-bold mb-2'>
            {props.children}
          </h1>
        )
      case 'heading-two':
        return (
          <h2 {...props.attributes} style={style} className='text-3xl font-bold mb-2'>
            {props.children}
          </h2>
        )
      case 'heading-three':
        return (
          <h3 {...props.attributes} style={style} className='text-2xl font-bold mb-2'>
            {props.children}
          </h3>
        )
      case 'heading-four':
        return (
          <h4 {...props.attributes} style={style} className='text-xl font-bold mb-2'>
            {props.children}
          </h4>
        )
      case 'heading-five':
        return (
          <h5 {...props.attributes} style={style} className='text-lg font-bold mb-2'>
            {props.children}
          </h5>
        )
      case 'heading-six':
        return (
          <h6 {...props.attributes} style={style} className='text-base font-bold mb-2'>
            {props.children}
          </h6>
        )
      case 'block-quote':
        return (
          <blockquote {...props.attributes} style={style} className='border-l-4 border-gray-300 pl-4 italic my-2'>
            {props.children}
          </blockquote>
        )
      case 'bulleted-list':
        return (
          <ul {...props.attributes} className='list-disc list-inside my-2'>
            {props.children}
          </ul>
        )
      case 'numbered-list':
        return (
          <ol {...props.attributes} className='list-decimal list-inside my-2'>
            {props.children}
          </ol>
        )
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>
      case 'link':
        return (
          <a
            {...props.attributes}
            href={(props.element as any).url}
            className='text-blue-600 underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            {props.children}
          </a>
        )
      case 'image':
        return (
          <div {...props.attributes}>
            <div contentEditable={false}>
              <img src={(props.element as any).url} alt='' className='max-w-full h-auto my-2' />
            </div>
            {props.children}
          </div>
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

  const isMarkActive = (editor: Editor, format: keyof Omit<CustomText, 'text'>) => {
    const marks = Editor.marks(editor)
    return marks ? marks[format] === true : false
  }

  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = isMarkActive(editor, format)
    if (isActive) {
      Editor.removeMark(editor, format)
    } else {
      Editor.addMark(editor, format, true)
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

  const insertLink = () => {
    const url = window.prompt('Enter the URL:')
    if (!url) return

    const { selection } = editor
    const isCollapsed = selection && selection.anchor.offset === selection.focus.offset

    if (isCollapsed) {
      Transforms.insertNodes(editor, {
        type: 'link',
        url,
        children: [{ text: url }]
      } as any)
    } else {
      Transforms.wrapNodes(editor, { type: 'link', url, children: [] } as any, { split: true })
    }
  }

  const insertImage = () => {
    const url = window.prompt('Enter image URL:')
    if (!url) return

    const image = { type: 'image', url, children: [{ text: '' }] }
    Transforms.insertNodes(editor, image as any)
  }

  const getCurrentBlockType = () => {
    const { selection } = editor
    if (!selection) return 'paragraph'

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && !LIST_TYPES.includes((n as any).type)
      })
    )

    if (match) {
      const element = match[0] as CustomElement
      return element.type || 'paragraph'
    }

    return 'paragraph'
  }

  const handleBlockTypeChange = (type: string) => {
    toggleBlock(type)
  }

  return (
    <div className={`border rounded-md ${className}`}>
      <div className='flex flex-wrap gap-1 p-2 border-b bg-muted items-center'>
        <Select value={getCurrentBlockType()} onValueChange={handleBlockTypeChange}>
          <SelectTrigger className='w-[140px] h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='paragraph'>Paragraph</SelectItem>
            <SelectItem value='heading-one'>Heading 1</SelectItem>
            <SelectItem value='heading-two'>Heading 2</SelectItem>
            <SelectItem value='heading-three'>Heading 3</SelectItem>
            <SelectItem value='heading-four'>Heading 4</SelectItem>
            <SelectItem value='heading-five'>Heading 5</SelectItem>
            <SelectItem value='heading-six'>Heading 6</SelectItem>
            <SelectItem value='block-quote'>Quote</SelectItem>
          </SelectContent>
        </Select>

        <div className='w-px h-6 bg-border mx-1' />

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

        <div className='w-px h-6 bg-border mx-1' />

        <Button type='button' variant='ghost' size='sm' onClick={insertLink}>
          <LinkIcon className='h-4 w-4' />
        </Button>
        {/* <Button type='button' variant='ghost' size='sm' onClick={insertImage}>
          <ImageIcon className='h-4 w-4' />
        </Button> */}
      </div>
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder={placeholder}
          className='p-4'
        //   style={{ minHeight }}
        />
      </Slate>
    </div>
  )
}

export default RichTextEditor
