'use client'

import { forwardRef, useEffect, useImperativeHandle } from 'react'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TipTapRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export interface TipTapRichTextEditorRef {
  insertText: (text: string) => void
  focus: () => void
}

const TipTapRichTextEditor = forwardRef<TipTapRichTextEditorRef, TipTapRichTextEditorProps>(
  function TipTapRichTextEditor(
    { value, onChange, placeholder = 'Type here...', className, disabled = false }: TipTapRichTextEditorProps,
    ref
  ) {
    const editor = useEditor({
      immediatelyRender: false,
      editable: !disabled,
      content: value || '',
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: 'https'
        }),
        Placeholder.configure({
          placeholder
        })
      ],
      onUpdate: ({ editor: currentEditor }) => {
        onChange(currentEditor.getHTML())
      }
    })

    useEffect(() => {
      if (!editor) return

      editor.setEditable(!disabled)
    }, [editor, disabled])

    useEffect(() => {
      if (!editor) return

      const incomingHtml = value || ''
      const currentHtml = editor.getHTML()

      if (incomingHtml && incomingHtml !== currentHtml) {
        editor.commands.setContent(incomingHtml, { emitUpdate: false })
      }

      if (!incomingHtml && !editor.isEmpty) {
        editor.commands.clearContent(false)
      }
    }, [editor, value])

    useImperativeHandle(
      ref,
      () => ({
        insertText: (text: string) => {
          if (!editor) return

          editor.chain().focus().insertContent(text).run()
        },
        focus: () => {
          if (!editor) return

          editor.chain().focus().run()
        }
      }),
      [editor]
    )

    const toggleLink = () => {
      if (!editor) return

      const previousUrl = (editor.getAttributes('link')?.href as string) || ''
      const url = window.prompt('Enter URL', previousUrl || 'https://')

      if (url === null) return

      if (url.trim() === '') {
        editor.chain().focus().unsetLink().run()

        return
      }

      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
      <div
        className={cn(
          'flex w-full flex-col rounded-md border border-border bg-transparent text-base shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring md:text-sm',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div className='flex flex-wrap items-center gap-1 border-b border-border bg-transparent p-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={editor?.isActive('bold') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Bold'
          >
            <Bold className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={editor?.isActive('italic') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Italic'
          >
            <Italic className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={editor?.isActive('underline') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Underline'
          >
            <UnderlineIcon className='h-4 w-4' />
          </Button>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor?.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 1'
          >
            <Heading1 className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor?.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 2'
          >
            <Heading2 className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor?.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 3'
          >
            H3
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
            className={editor?.isActive('heading', { level: 4 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 4'
          >
            H4
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 5 }).run()}
            className={editor?.isActive('heading', { level: 5 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 5'
          >
            H5
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleHeading({ level: 6 }).run()}
            className={editor?.isActive('heading', { level: 6 }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Heading 6'
          >
            H6
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={editor?.isActive('bulletList') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Bullet List'
          >
            <List className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={editor?.isActive('orderedList') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Numbered List'
          >
            <ListOrdered className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={editor?.isActive('blockquote') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Block Quote'
          >
            <Quote className='h-4 w-4' />
          </Button>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().setTextAlign('left').run()}
            className={editor?.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Align Left'
          >
            <AlignLeft className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().setTextAlign('center').run()}
            className={editor?.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Align Center'
          >
            <AlignCenter className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().setTextAlign('right').run()}
            className={editor?.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Align Right'
          >
            <AlignRight className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
            className={editor?.isActive({ textAlign: 'justify' }) ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Align Justify'
          >
            <AlignJustify className='h-4 w-4' />
          </Button>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={toggleLink}
            className={editor?.isActive('link') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Set Link'
          >
            <LinkIcon className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().unsetLink().run()}
            disabled={disabled}
            aria-label='Remove Link'
          >
            <Unlink className='h-4 w-4' />
          </Button>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={disabled || !editor?.can().chain().focus().undo().run()}
            aria-label='Undo'
          >
            <Undo2 className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={disabled || !editor?.can().chain().focus().redo().run()}
            aria-label='Redo'
          >
            <Redo2 className='h-4 w-4' />
          </Button>
        </div>

        <EditorContent
          editor={editor}
          className='[&_.ProseMirror]:min-h-48 [&_.ProseMirror]:w-full [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-base [&_.ProseMirror]:text-background [&_.ProseMirror]:outline-none [&_.ProseMirror]:md:text-sm [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]'
        />
      </div>
    )
  }
)

TipTapRichTextEditor.displayName = 'TipTapRichTextEditor'

export default TipTapRichTextEditor
