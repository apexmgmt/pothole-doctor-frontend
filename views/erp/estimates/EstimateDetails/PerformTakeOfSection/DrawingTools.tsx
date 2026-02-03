import { POLYGON_COLORS } from '@/constants/take-off-data'
import { Hand, Pencil, Scissors } from 'lucide-react'
import { toast } from 'sonner'

const DrawingTools = ({
  activeTool,
  setActiveTool,
  setSelectedPolygonForCut,
  drawingManager,
  setMapDraggable,
  selectedColorIndex = 0,
  selectedPolygonForCut
}: {
  activeTool: string | null
  setActiveTool: (tool: 'polygon' | 'cut' | 'hand' | null) => void
  setSelectedPolygonForCut: (polygonId: string | null) => void
  drawingManager: google.maps.drawing.DrawingManager | null
  setMapDraggable: (draggable: boolean) => void
  selectedColorIndex: number
  selectedPolygonForCut: string | null
}) => {
  // Toggle tools
  const toggleTool = (tool: 'polygon' | 'cut' | 'hand') => {
    if (activeTool === tool) {
      setActiveTool(null)
      setSelectedPolygonForCut(null)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }

      setMapDraggable(true)

      return
    }

    setActiveTool(tool)

    if (tool === 'polygon') {
      if (drawingManager) {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
        drawingManager.setOptions({
          polygonOptions: {
            fillColor: POLYGON_COLORS[selectedColorIndex].fill,
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: POLYGON_COLORS[selectedColorIndex].stroke,
            editable: false,
            draggable: false
          }
        })
      }

      setMapDraggable(false)
    } else if (tool === 'hand') {
      setMapDraggable(true)

      if (drawingManager) {
        drawingManager.setDrawingMode(null)
      }

      setSelectedPolygonForCut(null)
    } else if (tool === 'cut') {
      toast.info('Select a polygon from the right panel, then draw the cut area')
      setMapDraggable(false)
    }
  }

  return (
    <div className='lg:space-y-1 flex flex-row lg:flex-col gap-2'>
      <button
        onClick={() => toggleTool('polygon')}
        className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
          activeTool === 'polygon' ? 'bg-blue-600 border-blue-500' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
        }`}
        title='Draw Polygon'
      >
        <Pencil className='w-5 h-5 text-white' />
      </button>

      <button
        onClick={() => toggleTool('cut')}
        className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
          activeTool === 'cut' ? 'bg-red-600 border-red-500' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
        }`}
        title={selectedPolygonForCut ? 'Draw cut area on map' : 'Select a polygon first, then click cut'}
      >
        <Scissors className='w-5 h-5 text-white' />
      </button>

      <button
        onClick={() => toggleTool('hand')}
        className={`w-10 h-10 flex items-center justify-center rounded border transition-all ${
          activeTool === 'hand' ? 'bg-green-600 border-green-500' : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'
        }`}
        title='Hand Tool (Pan)'
      >
        <Hand className='w-5 h-5 text-white' />
      </button>
    </div>
  )
}

export default DrawingTools
