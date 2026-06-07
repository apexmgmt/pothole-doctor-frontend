'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from 'react'

import { mergeAttributes, Node, type CommandProps, type NodeViewRendererProps } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
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
  Redo2,
  Upload,
  Baseline,
  Highlighter,
  Palette
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TipTapRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onUploadMedia?: (file: File) => Promise<string>
  onExpandedChange?: (isExpanded: boolean) => void
  inputClassName?: string
}

export interface TipTapRichTextEditorRef {
  insertText: (text: string) => void
  focus: () => void
  collapse: (force?: boolean) => void
  clear: () => void
}

type MediaAlign = 'left' | 'center' | 'right'

const normalizeMediaWidth = (width?: string | null) => {
  const value = String(width || '100%').trim()

  return value || '100%'
}

const normalizeMediaAlign = (align?: string | null): MediaAlign => {
  if (align === 'left' || align === 'right' || align === 'center') {
    return align
  }

  return 'center'
}

const buildMediaStyle = (width: string, align: MediaAlign, currentStyle?: string) => {
  const baseStyles = [
    `width:${normalizeMediaWidth(width)}`,
    'max-width:100%',
    'height:auto',
    'display:block',
    'margin-top:0.5rem',
    'margin-bottom:0.5rem',
    'border-radius:0.375rem'
  ]

  if (align === 'left') {
    baseStyles.push('margin-left:0', 'margin-right:auto')
  } else if (align === 'right') {
    baseStyles.push('margin-left:auto', 'margin-right:0')
  } else {
    baseStyles.push('margin-left:auto', 'margin-right:auto')
  }

  const preservedStyles = (currentStyle || '')
    .split(';')
    .map(style => style.trim())
    .filter(
      style =>
        style &&
        !style.startsWith('width:') &&
        !style.startsWith('max-width:') &&
        !style.startsWith('height:') &&
        !style.startsWith('display:') &&
        !style.startsWith('margin-left:') &&
        !style.startsWith('margin-right:') &&
        !style.startsWith('margin-top:') &&
        !style.startsWith('margin-bottom:') &&
        !style.startsWith('border-radius:')
    )

  return [...baseStyles, ...preservedStyles].join(';')
}

const getMediaWidthPercent = (width?: string | null) => {
  const normalized = normalizeMediaWidth(width)

  if (normalized.endsWith('%')) {
    const parsed = Number.parseFloat(normalized)

    if (!Number.isNaN(parsed)) {
      return Math.min(100, Math.max(20, parsed))
    }
  }

  return 100
}

const createInlineMediaNodeView = (tagName: 'img' | 'video', includeAlt = false) => {
  return ({ node, editor, getPos }: NodeViewRendererProps) => {
    let currentNode = node

    const wrapper = document.createElement('div')

    wrapper.style.cssText = 'position:relative;display:block;'

    const mediaElement = document.createElement(tagName)

    mediaElement.setAttribute('draggable', 'true')

    if (tagName === 'video') {
      mediaElement.setAttribute('controls', '')
      mediaElement.setAttribute('preload', 'metadata')
    }

    wrapper.appendChild(mediaElement)

    const controls = document.createElement('div')

    controls.style.cssText =
      'position:absolute;top:0.5rem;right:0.5rem;display:none;align-items:center;gap:0.25rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.25rem 0.4rem;border-radius:0.5rem;box-shadow:0 6px 20px rgba(0, 0, 0, 0.18);z-index:10;'

    const updateNodeAttrs = (attrs: Record<string, string>) => {
      if (!editor.isEditable) return

      const pos = getPos()

      if (typeof pos !== 'number') return

      editor
        .chain()
        .focus()
        .command((commandProps: CommandProps) => {
          commandProps.tr.setNodeMarkup(pos, undefined, {
            ...currentNode.attrs,
            ...attrs
          })

          return true
        })
        .run()
    }

    const makeAlignButton = (label: string, align: MediaAlign) => {
      const button = document.createElement('button')

      button.type = 'button'
      button.textContent = label
      button.style.cssText =
        'border:1px solid hsl(var(--border));background:transparent;border-radius:0.35rem;padding:0.1rem 0.35rem;font-size:0.7rem;cursor:pointer;'

      button.addEventListener('click', event => {
        event.preventDefault()
        event.stopPropagation()

        updateNodeAttrs({ align })
      })

      return button
    }

    const alignButtons: Record<MediaAlign, HTMLButtonElement> = {
      left: makeAlignButton('L', 'left'),
      center: makeAlignButton('C', 'center'),
      right: makeAlignButton('R', 'right')
    }

    controls.appendChild(alignButtons.left)
    controls.appendChild(alignButtons.center)
    controls.appendChild(alignButtons.right)

    const widthInput = document.createElement('input')

    widthInput.type = 'range'
    widthInput.min = '20'
    widthInput.max = '100'
    widthInput.step = '1'
    widthInput.title = 'Resize media width'
    widthInput.style.cssText = 'width:80px;cursor:ew-resize;'

    const widthValue = document.createElement('span')

    widthValue.style.cssText = 'min-width:2.3rem;font-size:0.7rem;color:hsl(var(--muted-foreground));'

    widthInput.addEventListener('input', event => {
      event.stopPropagation()

      updateNodeAttrs({ width: `${widthInput.value}%` })
    })

    controls.appendChild(widthInput)
    controls.appendChild(widthValue)
    wrapper.appendChild(controls)

    const syncNodeState = () => {
      const src = String(currentNode.attrs.src || '')
      const width = normalizeMediaWidth(currentNode.attrs.width as string)
      const align = normalizeMediaAlign(currentNode.attrs.align as string)

      mediaElement.setAttribute('src', src)
      mediaElement.setAttribute('data-width', width)
      mediaElement.setAttribute('data-align', align)
      mediaElement.setAttribute('style', buildMediaStyle(width, align, ''))

      if (includeAlt) {
        mediaElement.setAttribute('alt', String(currentNode.attrs.alt || ''))
      }

      const widthPercent = getMediaWidthPercent(width)

      widthInput.value = String(widthPercent)
      widthValue.textContent = `${Math.round(widthPercent)}%`

      Object.entries(alignButtons).forEach(([alignKey, button]) => {
        const isActive = alignKey === align

        button.style.background = isActive ? 'hsl(var(--accent))' : 'transparent'
        button.style.color = isActive ? 'hsl(var(--accent-foreground))' : 'inherit'
      })
    }

    syncNodeState()

    return {
      dom: wrapper,
      selectNode: () => {
        wrapper.style.outline = '2px solid hsl(var(--ring))'
        wrapper.style.outlineOffset = '2px'
        controls.style.display = editor.isEditable ? 'inline-flex' : 'none'
      },
      deselectNode: () => {
        wrapper.style.outline = 'none'
        controls.style.display = 'none'
      },
      update: (updatedNode: NodeViewRendererProps['node']) => {
        if (updatedNode.type.name !== currentNode.type.name) {
          return false
        }

        currentNode = updatedNode
        syncNodeState()

        return true
      }
    }
  }
}

const MediaImage = Node.create({
  name: 'mediaImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      width: {
        default: '100%',
        parseHTML: element =>
          normalizeMediaWidth(
            element.getAttribute('data-width') || element.getAttribute('width') || element.style.width
          ),
        renderHTML: attributes => ({
          'data-width': normalizeMediaWidth(attributes.width)
        })
      },
      align: {
        default: 'center',
        parseHTML: element => normalizeMediaAlign(element.getAttribute('data-align')),
        renderHTML: attributes => ({
          'data-align': normalizeMediaAlign(attributes.align)
        })
      }
    }
  },
  addNodeView() {
    return createInlineMediaNodeView('img', true)
  },
  parseHTML() {
    return [{ tag: 'img[src]' }]
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, style, ...rest } = HTMLAttributes

    return [
      'img',
      mergeAttributes(rest, {
        style: buildMediaStyle(normalizeMediaWidth(width), normalizeMediaAlign(align), style)
      })
    ]
  }
})

const MediaVideo = Node.create({
  name: 'mediaVideo',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: '100%',
        parseHTML: element =>
          normalizeMediaWidth(
            element.getAttribute('data-width') || element.getAttribute('width') || element.style.width
          ),
        renderHTML: attributes => ({
          'data-width': normalizeMediaWidth(attributes.width)
        })
      },
      align: {
        default: 'center',
        parseHTML: element => normalizeMediaAlign(element.getAttribute('data-align')),
        renderHTML: attributes => ({
          'data-align': normalizeMediaAlign(attributes.align)
        })
      }
    }
  },
  addNodeView() {
    return createInlineMediaNodeView('video')
  },
  parseHTML() {
    return [{ tag: 'video[src]' }]
  },
  renderHTML({ HTMLAttributes }) {
    const { width, align, style, ...rest } = HTMLAttributes

    return [
      'video',
      mergeAttributes(
        {
          controls: '',
          preload: 'metadata'
        },
        rest,
        {
          style: buildMediaStyle(normalizeMediaWidth(width), normalizeMediaAlign(align), style)
        }
      )
    ]
  }
})

const isMediaFile = (file: File) => file.type.startsWith('image/') || file.type.startsWith('video/')

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result || ''))

    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))

    reader.readAsDataURL(file)
  })

const hasDraggedFiles = (event: DragEvent<HTMLDivElement>) =>
  Array.from(event.dataTransfer?.types || []).includes('Files')

const hasVisibleText = (html: string) => {
  if (!html) return false

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  if (doc.body.querySelector('img, video')) {
    return true
  }

  const text = (doc.body.textContent || '').replace(/\u00A0/g, ' ').trim()

  return Boolean(text)
}

const TEXT_COLORS = [
  '#000000', // Black
  '#4B5563', // Gray
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899' // Pink
]

const HIGHLIGHT_COLORS = [
  '#FEE2E2', // Soft Red
  '#FFEDD5', // Soft Orange
  '#FEF08A', // Soft Yellow
  '#DCFCE7', // Soft Green
  '#DBEAFE', // Soft Blue
  '#E0E7FF', // Soft Indigo
  '#F3E8FF', // Soft Purple
  '#FCE7F3', // Soft Pink
  '#F3F4F6', // Soft Gray
  '#FFFFFF' // White
]

interface CustomColorRowProps {
  initialColor: string
  onSelect: (color: string) => void
  onCancel: () => void
  onReset: () => void
  title: string
}

const CustomColorRow = ({ initialColor, onSelect, onCancel, onReset, title }: CustomColorRowProps) => {
  const [tempColor, setTempColor] = useState(initialColor)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    setTempColor(initialColor)
    setShowControls(false)
  }, [initialColor])

  return (
    <div className='flex flex-col gap-1.5 border-t border-border mt-1 pt-1.5'>
      <div className='flex items-center justify-between gap-2'>
        <Button
          type='button'
          variant='ghost'
          className='h-6 text-[11px] px-1.5 py-0 justify-start font-normal'
          onClick={onReset}
        >
          Reset Color
        </Button>
        <label className='relative flex items-center gap-1 cursor-pointer group shrink-0' title={title}>
          <input
            type='color'
            value={tempColor}
            onChange={e => {
              setTempColor(e.target.value)
              setShowControls(true)
            }}
            className='w-5 h-5 rounded cursor-pointer border border-border/40 p-0 bg-transparent opacity-0 absolute inset-0'
          />
          <Palette className='h-4 w-4 text-muted-foreground transition-transform group-hover:scale-105' />
        </label>
      </div>
      {showControls && (
        <div className='flex items-center justify-end gap-1.5 mt-0.5 border-t border-border/30 pt-1'>
          <Button
            type='button'
            className='h-5 text-[10px] px-2 py-0 font-medium rounded'
            onClick={() => {
              onSelect(tempColor)
              setShowControls(false)
            }}
          >
            Ok
          </Button>
          <Button
            type='button'
            variant='outline'
            className='h-5 text-[10px] px-2 py-0 font-medium rounded'
            onClick={() => {
              onCancel()
              setShowControls(false)
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}

const TipTapRichTextEditor = forwardRef<TipTapRichTextEditorRef, TipTapRichTextEditorProps>(
  function TipTapRichTextEditor(
    {
      value,
      onChange,
      placeholder = 'Type here...',
      className,
      disabled = false,
      onUploadMedia,
      onExpandedChange,
      inputClassName
    }: TipTapRichTextEditorProps,
    ref
  ) {
    const [isExpanded, setIsExpanded] = useState(() => hasVisibleText(value || ''))
    const [isDragOver, setIsDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const dragCounterRef = useRef(0)
    const suppressNextExpandRef = useRef(false)

    const editor = useEditor({
      immediatelyRender: false,
      editable: !disabled,
      content: value || '',
      extensions: [
        StarterKit,
        MediaImage,
        MediaVideo,
        Underline,
        TextStyle,
        Color,
        Highlight.configure({
          multicolor: true
        }),
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

    const [isTextColorOpen, setIsTextColorOpen] = useState(false)
    const [isHighlightColorOpen, setIsHighlightColorOpen] = useState(false)

    const handleTextColorOpenChange = useCallback((open: boolean) => {
      setIsTextColorOpen(open)
    }, [])

    const handleHighlightColorOpenChange = useCallback((open: boolean) => {
      setIsHighlightColorOpen(open)
    }, [])

    const setExpanded = useCallback((nextExpanded: boolean) => {
      setIsExpanded(prev => (prev === nextExpanded ? prev : nextExpanded))
    }, [])

    const insertMediaFiles = useCallback(
      async (files: File[]) => {
        if (!editor || disabled || files.length === 0) return

        const supportedFiles = files.filter(isMediaFile)

        if (supportedFiles.length === 0) return

        setExpanded(true)

        for (const file of supportedFiles) {
          try {
            const src = onUploadMedia ? await onUploadMedia(file) : await readFileAsDataUrl(file)

            if (!src) continue

            if (file.type.startsWith('image/')) {
              editor
                .chain()
                .focus()
                .insertContent([
                  {
                    type: 'mediaImage',
                    attrs: {
                      src,
                      alt: file.name,
                      width: '100%',
                      align: 'center'
                    }
                  },
                  {
                    type: 'paragraph'
                  }
                ])
                .run()
            } else {
              editor
                .chain()
                .focus()
                .insertContent([
                  {
                    type: 'mediaVideo',
                    attrs: {
                      src,
                      width: '100%',
                      align: 'center'
                    }
                  },
                  {
                    type: 'paragraph'
                  }
                ])
                .run()
            }
          } catch (error) {
            console.error('Failed to insert media file into editor:', error)
          }
        }
      },
      [disabled, editor, onUploadMedia]
    )

    const openMediaPicker = () => {
      if (disabled) return

      fileInputRef.current?.click()
    }

    const handleMediaInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || [])

      void insertMediaFiles(files)

      event.target.value = ''
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      if (disabled || !hasDraggedFiles(event)) return

      event.preventDefault()
      dragCounterRef.current += 1
      setIsDragOver(true)
    }

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      if (disabled || !hasDraggedFiles(event)) return

      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      if (!hasDraggedFiles(event)) return

      event.preventDefault()
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)

      if (dragCounterRef.current === 0) {
        setIsDragOver(false)
      }
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      if (disabled || !editor) return

      if (!hasDraggedFiles(event)) return

      event.preventDefault()
      dragCounterRef.current = 0
      setIsDragOver(false)

      const droppedFiles = Array.from(event.dataTransfer.files || [])

      if (droppedFiles.length === 0) return

      const dropPosition = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY
      })

      if (dropPosition?.pos != null) {
        editor.chain().focus(dropPosition.pos).run()
      }

      void insertMediaFiles(droppedFiles)
    }

    useEffect(() => {
      if (!editor) return

      editor.setEditable(!disabled)
    }, [editor, disabled])

    useEffect(() => {
      if (!editor) return

      const incomingHtml = value || ''
      const currentHtml = editor.getHTML()
      const incomingHasText = hasVisibleText(incomingHtml)
      const currentHasText = hasVisibleText(currentHtml)

      if (incomingHtml !== currentHtml && (incomingHasText || currentHasText)) {
        editor.commands.setContent(incomingHtml, { emitUpdate: false })
      }

      if (!isExpanded && incomingHasText) {
        if (!suppressNextExpandRef.current) {
          setExpanded(true)
        }

        suppressNextExpandRef.current = false
      }
    }, [editor, value, isExpanded, setExpanded])

    useEffect(() => {
      onExpandedChange?.(isExpanded)
    }, [isExpanded, onExpandedChange])

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
        },
        collapse: (force = true) => {
          if (!editor) return

          if (disabled && !force) return

          const currentHtml = editor.getHTML()

          if (!force && hasVisibleText(currentHtml)) {
            return
          }

          suppressNextExpandRef.current = true
          setExpanded(false)
        },
        clear: () => {
          if (!editor) return

          suppressNextExpandRef.current = true
          editor.commands.clearContent(false)
        }
      }),
      [editor, disabled, setExpanded]
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

    const expandEditor = () => {
      if (disabled) return

      setExpanded(true)
      editor?.chain().focus().run()
    }

    return (
      <div
        className={cn(
          'flex w-full flex-col rounded-md border border-border bg-transparent text-base shadow-sm transition-colors md:text-sm',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <div
          className={cn(
            'flex flex-wrap items-center gap-1 border-b border-border bg-transparent p-2',
            !isExpanded && 'hidden'
          )}
        >
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={editor?.isActive('underline') ? 'bg-accent' : ''}
            disabled={disabled}
            aria-label='Underline'
          >
            <UnderlineIcon className='h-4 w-4' />
          </Button>

          {/* Text Color Popover */}
          <Popover open={isTextColorOpen} onOpenChange={handleTextColorOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon-xs'
                disabled={disabled}
                aria-label='Text Color'
                className='relative flex flex-col items-center justify-center'
              >
                <Baseline className='h-3.5 w-3.5' />
                <span
                  className='absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-[2px] rounded-full'
                  style={{ backgroundColor: editor?.getAttributes('textStyle').color || 'currentColor' }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='z-50 w-44 rounded-md border border-border bg-[#09090B] p-2 shadow-md outline-none'
              align='start'
              onFocusOutside={e => e.preventDefault()}
              onPointerDownOutside={e => {
                if (e.target instanceof Element && e.target.closest('[type="color"]')) {
                  e.preventDefault()
                }
              }}
              onCloseAutoFocus={e => e.preventDefault()}
            >
              <div className='flex flex-col gap-2'>
                <div className='text-[10px] font-semibold uppercase tracking-wider px-1'>Text Color</div>
                <div className='grid grid-cols-5 gap-1'>
                  {TEXT_COLORS.map(color => {
                    const isActive = editor?.getAttributes('textStyle').color === color

                    return (
                      <button
                        key={color}
                        type='button'
                        onClick={() => {
                          editor?.chain().focus().setColor(color).run()
                          setIsTextColorOpen(false)
                        }}
                        className={cn(
                          'w-6 h-6 rounded-full border border-border/40 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center relative',
                          isActive && 'ring-1 ring-ring ring-offset-1 ring-offset-background'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {isActive && <div className='w-1.5 h-1.5 rounded-full bg-white mix-blend-difference' />}
                      </button>
                    )
                  })}
                </div>
                <CustomColorRow
                  initialColor={editor?.getAttributes('textStyle').color || '#000000'}
                  title='Custom Color'
                  onReset={() => {
                    editor?.chain().focus().unsetColor().run()
                    setIsTextColorOpen(false)
                  }}
                  onSelect={color => {
                    editor?.chain().focus().setColor(color).run()
                    setIsTextColorOpen(false)
                  }}
                  onCancel={() => {
                    setIsTextColorOpen(false)
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight Color Popover */}
          <Popover open={isHighlightColorOpen} onOpenChange={handleHighlightColorOpenChange}>
            <PopoverTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon-xs'
                disabled={disabled}
                aria-label='Highlight Color'
                className='relative flex flex-col items-center justify-center'
              >
                <Highlighter className='h-3.5 w-3.5' />
                <span
                  className='absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-[2px] rounded-full'
                  style={{ backgroundColor: editor?.getAttributes('highlight').color || 'transparent' }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='z-50 w-44 rounded-md border border-border bg-[#09090B] p-2 shadow-md outline-none'
              align='start'
              onFocusOutside={e => e.preventDefault()}
              onPointerDownOutside={e => {
                if (e.target instanceof Element && e.target.closest('[type="color"]')) {
                  e.preventDefault()
                }
              }}
              onCloseAutoFocus={e => e.preventDefault()}
            >
              <div className='flex flex-col gap-2'>
                <div className='text-[10px] font-semibold uppercase tracking-wider px-1'>Highlight</div>
                <div className='grid grid-cols-5 gap-1'>
                  {HIGHLIGHT_COLORS.map(color => {
                    const isActive = editor?.getAttributes('highlight').color === color

                    return (
                      <button
                        key={color}
                        type='button'
                        onClick={() => {
                          editor?.chain().focus().setHighlight({ color }).run()
                          setIsHighlightColorOpen(false)
                        }}
                        className={cn(
                          'w-6 h-6 rounded-full border border-border/40 cursor-pointer transition-transform hover:scale-110 flex items-center justify-center relative',
                          isActive && 'ring-1 ring-ring ring-offset-1 ring-offset-background'
                        )}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {isActive && <div className='w-1.5 h-1.5 rounded-full bg-black' />}
                      </button>
                    )
                  })}
                </div>
                <CustomColorRow
                  initialColor={editor?.getAttributes('highlight').color || '#ffff00'}
                  title='Custom Highlight'
                  onReset={() => {
                    editor?.chain().focus().unsetHighlight().run()
                    setIsHighlightColorOpen(false)
                  }}
                  onSelect={color => {
                    editor?.chain().focus().setHighlight({ color }).run()
                    setIsHighlightColorOpen(false)
                  }}
                  onCancel={() => {
                    setIsHighlightColorOpen(false)
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
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
            size='icon-xs'
            onClick={() => editor?.chain().focus().unsetLink().run()}
            disabled={disabled}
            aria-label='Remove Link'
          >
            <Unlink className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            onClick={openMediaPicker}
            disabled={disabled}
            aria-label='Upload Image or Video'
          >
            <Upload className='h-4 w-4' />
          </Button>

          <div className='mx-1 h-6 w-px bg-border' />

          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={disabled || !editor?.can().chain().focus().undo().run()}
            aria-label='Undo'
          >
            <Undo2 className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-xs'
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={disabled || !editor?.can().chain().focus().redo().run()}
            aria-label='Redo'
          >
            <Redo2 className='h-4 w-4' />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*,video/*'
          multiple
          onChange={handleMediaInputChange}
          className='hidden'
          disabled={disabled}
          tabIndex={-1}
          aria-hidden='true'
        />

        <EditorContent
          editor={editor}
          onClick={expandEditor}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            '[&_.ProseMirror]:w-full [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-base [&_.ProseMirror]:text-background [&_.ProseMirror]:outline-none [&_.ProseMirror]:md:text-sm [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
            isExpanded
              ? '[&_.ProseMirror]:min-h-24 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_img]:my-2 [&_.ProseMirror_img]:max-h-80 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_video]:my-2 [&_.ProseMirror_video]:max-h-80 [&_.ProseMirror_video]:max-w-full [&_.ProseMirror_video]:rounded-md'
              : '[&_.ProseMirror]:min-h-10 [&_.ProseMirror]:cursor-text',
            isDragOver &&
              '[&_.ProseMirror]:bg-accent/20 [&_.ProseMirror]:outline-2 [&_.ProseMirror]:outline-dashed [&_.ProseMirror]:outline-primary/60',
            inputClassName
          )}
        />
        {isDragOver && !disabled ? (
          <p className='px-3 pb-2 text-xs text-muted-foreground'>Drop image or video here to insert it</p>
        ) : null}
      </div>
    )
  }
)

TipTapRichTextEditor.displayName = 'TipTapRichTextEditor'

export default TipTapRichTextEditor
