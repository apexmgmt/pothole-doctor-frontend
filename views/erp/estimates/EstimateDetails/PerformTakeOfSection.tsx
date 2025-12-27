import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const PerformTakeOfSection = () => {
  return (
    <Card className='bg-zinc-900 border-zinc-800'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-white text-base'></CardTitle>
        <Button size='sm' variant='outline' className='text-xs px-3 py-1'>
          Perform take-of
        </Button>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-center h-32 bg-zinc-800 rounded-md'>
          <span className='text-zinc-400 text-sm'>No Data</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformTakeOfSection
