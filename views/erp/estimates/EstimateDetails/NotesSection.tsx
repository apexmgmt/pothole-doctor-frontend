import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StickyNote } from 'lucide-react'

const notes = [
  {
    text: "We'd love to hear from you about our entire service. Your comments and suggestions will be highly appreciated. Please complete the form below.",
    author: 'David warner',
    date: 'Jan 12, 11:25PM'
  },
  {
    text: "We'd love to hear from you about our entire service. Your comments and suggestions will be highly appreciated. Please complete the form below.",
    author: 'David warner',
    date: 'Jan 12, 11:25PM'
  },
  {
    text: "We'd love to hear from you about our entire service. Your comments and suggestions will be highly appreciated. Please complete the form below.",
    author: 'David warner',
    date: 'Jan 12, 11:25PM'
  }
]

const NotesSection = () => {
  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='flex items-center gap-2'>
          <StickyNote className='text-zinc-300 w-5 h-5' />
          <CardTitle className='text-white text-base'>Notes</CardTitle>
        </div>
        <Button size='sm' variant='outline' className='text-xs px-3 py-1 flex items-center gap-1 text-black bg-white'>
          + Add
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className='max-h-80 pr-2'>
          {notes.map((note, idx) => (
            <div key={idx} className='mb-4'>
              <div className='text-zinc-200 text-sm mb-2'>{note.text}</div>
              <div className='flex items-center justify-between text-xs text-zinc-400 mb-2'>
                <span>
                  Created bt <span className='font-semibold text-zinc-300'>{note.author}</span>
                </span>
                <span>{note.date}</span>
              </div>
              {idx < notes.length - 1 && <hr className='border-zinc-800' />}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default NotesSection
