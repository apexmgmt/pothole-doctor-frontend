import { Button } from '@/components/ui/button'
import { SavedPolygon } from '@/types'
import { Trash2 } from 'lucide-react'
import { SpinnerCustom } from '@/components/ui/spinner'

interface MeasurementsPanelProps {
  polygons: SavedPolygon[]
  totalArea: { squareFeet: number; squareMeters: number }
  hoveredPolygonId: string | null
  selectedPolygonForCut: string | null
  setHoveredPolygonId: (id: string | null) => void
  setSelectedPolygonForCut: (id: string | null) => void
  activeTool: 'polygon' | 'cut' | 'hand' | null
  deletePolygon: (id: string) => void
  clearAllPolygons: () => void
  savePolygons: () => Promise<void>
  isSaving: boolean
  drawingManager: google.maps.drawing.DrawingManager | null
}

export const MeasurementsPanel = ({
  polygons,
  totalArea,
  hoveredPolygonId,
  selectedPolygonForCut,
  setHoveredPolygonId,
  setSelectedPolygonForCut,
  activeTool,
  deletePolygon,
  clearAllPolygons,
  savePolygons,
  isSaving,
  drawingManager
}: MeasurementsPanelProps) => {
  return (
    <div className='w-full lg:w-80 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden flex flex-col min-w-92 max-h-[calc(100vh-200px)]'>
      <div className='bg-zinc-900 border-b border-zinc-700 px-4 py-3'>
        <h2 className='text-sm font-semibold text-white'>Measurements Panel</h2>
      </div>

      <div className='flex-1 overflow-y-auto space-y-3 p-4'>
        {polygons.length === 0 ? (
          <div className='flex items-center justify-center h-full text-zinc-400 text-xs'>
            <p>Draw polygons on the map to view measurements</p>
          </div>
        ) : (
          <>
            {/* Total Area */}
            <div className='bg-zinc-900 rounded-lg p-3 border border-zinc-700'>
              <p className='text-xs text-zinc-400 mb-2'>Total Area</p>
              <div className='space-y-1'>
                <p className='text-lg font-semibold text-white'>{totalArea.squareFeet.toFixed(2)} sq ft</p>
                <p className='text-xs text-zinc-400'>{totalArea.squareMeters.toFixed(2)} sq m</p>
              </div>
            </div>

            {/* Individual Areas */}
            <div className='space-y-2'>
              {polygons.map(polygon => (
                <div
                  key={polygon.id}
                  onMouseEnter={() => setHoveredPolygonId(polygon.id)}
                  onMouseLeave={() => {
                    setHoveredPolygonId(null)

                    if (activeTool !== 'cut') {
                      setSelectedPolygonForCut(null)
                    }
                  }}
                  className={`bg-zinc-900 rounded-lg p-3 border-2 cursor-pointer transition-all ${
                    hoveredPolygonId === polygon.id
                      ? `border-white ring-2 ring-white/50`
                      : selectedPolygonForCut === polygon.id
                        ? 'border-red-500 ring-2 ring-red-500/50'
                        : 'border-zinc-700'
                  }`}
                  style={{
                    borderColor:
                      hoveredPolygonId === polygon.id
                        ? polygon.color.stroke
                        : selectedPolygonForCut === polygon.id
                          ? '#ef4444'
                          : undefined
                  }}
                  onClick={() => {
                    if (activeTool === 'cut') {
                      setSelectedPolygonForCut(polygon.id)

                      // Only allow cut tool if a polygon is selected
                      if (drawingManager) {
                        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON)
                        drawingManager.setOptions({
                          polygonOptions: {
                            fillColor: '#ef4444',
                            fillOpacity: 0.3,
                            strokeWeight: 2,
                            strokeColor: '#dc2626',
                            editable: false,
                            draggable: false
                          }
                        })
                      }
                    }
                  }}
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-3 h-3 rounded-full border border-zinc-600'
                        style={{ backgroundColor: polygon.color.fill }}
                      />
                      <p className='text-sm font-semibold text-white'>{polygon.name}</p>
                    </div>
                    <Button
                      onClick={e => {
                        e.stopPropagation()
                        deletePolygon(polygon.id)
                      }}
                      size='sm'
                      variant='ghost'
                      className='text-red-400 hover:text-red-300 hover:bg-red-950/50 p-1 h-auto'
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>

                  {selectedPolygonForCut === polygon.id && (
                    <div className='mb-2 p-2 bg-red-950/50 rounded border border-red-700 text-xs text-red-300'>
                      Selected for cutting. Draw cut area on map.
                    </div>
                  )}

                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Square:</span>
                      <span className='text-white font-medium'>{polygon.area.squareFeet.toFixed(2)} sq ft</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-zinc-400'>Metric:</span>
                      <span className='text-white font-medium'>{polygon.area.squareMeters.toFixed(2)} sq m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {polygons.length > 0 && (
        <div className='border-t border-zinc-700 p-4 space-y-2'>
          <Button
            onClick={savePolygons}
            size='sm'
            className='w-full text-xs flex items-center justify-center gap-4'
            disabled={isSaving}
          >
            {isSaving && (
              <div className='relative'>
                <SpinnerCustom size='size-4' />
              </div>
            )}{' '}
            Save Areas ({polygons.length})
          </Button>
          <Button onClick={clearAllPolygons} size='sm' variant='outline' className='w-full text-xs'>
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
}
