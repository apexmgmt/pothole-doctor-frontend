'use client'

import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'

const InvoiceSignature = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const printImgRef = useRef<HTMLImageElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const [ready, setReady] = useState(false)

  const resizeCanvas = () => {
    const canvas = canvasRef.current

    if (!canvas || !padRef.current) return
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const data = padRef.current.toData()

    canvas.width = canvas.offsetWidth * ratio
    canvas.height = canvas.offsetHeight * ratio
    canvas.getContext('2d')?.scale(ratio, ratio)
    padRef.current.clear()
    padRef.current.fromData(data)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const printImg = printImgRef.current

    if (!canvas || !printImg) return

    const pad = new SignaturePad(canvas, {
      penColor: 'black',
      backgroundColor: 'white'
    })

    padRef.current = pad
    resizeCanvas()
    setReady(true)

    const handleEnd = () => setIsEmpty(pad.isEmpty())

    pad.addEventListener('endStroke', handleEnd)

    // Before printing: swap to white bg + black ink on the real canvas, export PNG, then restore
    const beforePrint = () => {
      if (pad.isEmpty()) return
      const data = pad.toData()

      // fromData replays stored per-stroke colors (white), so remap them to black for print
      const blackData = data.map(group => ({ ...group, color: 'black' }))

      pad.backgroundColor = 'white'
      pad.clear() // fills white bg
      pad.fromData(blackData)

      printImg.src = canvas.toDataURL('image/png')
      printImg.style.display = 'block'

      // Restore original dark colors for screen
      pad.backgroundColor = 'white'
      pad.penColor = 'black'
      pad.clear()
      pad.fromData(data)
    }

    // const afterPrint = () => {
    //   printImg.style.display = 'none'
    // }

    // window.addEventListener('beforeprint', beforePrint)
    // window.addEventListener('afterprint', afterPrint)
    window.addEventListener('resize', resizeCanvas)

    return () => {
      pad.off()
      window.removeEventListener('beforeprint', beforePrint)

      //   window.removeEventListener('afterprint', afterPrint)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  const handleClear = () => {
    padRef.current?.clear()
    setIsEmpty(true)
  }

  return (
    <div className='my-6 text-sm print:text-black'>
      <h3 className='text-base font-semibold mb-4 bg-border/40 print:bg-gray-100 px-3 py-2 rounded'>Signature</h3>

      <div className='space-y-4'>
        {/* Agreement checkbox */}
        <label className='flex items-center gap-2 cursor-pointer select-none'>
          <input
            type='checkbox'
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className='w-4 h-4 accent-primary print:appearance-auto'
          />
          <span className='text-sm text-primary-foreground print:text-black'>
            I have read and agree to the terms in the customer agreement.
          </span>
        </label>

        {/* Signature canvas — hidden on print, replaced by printImg */}
        <div className='relative w-72'>
          {ready && isEmpty && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              <span className='text-blue-400 italic text-sm'>Click here to sign.</span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{ touchAction: 'none' }}
            className='w-72 h-28 rounded border border-border cursor-crosshair'
          />
        </div>

        {/* Print-only image — white bg, black strokes, generated in beforeprint */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={printImgRef} alt='Signature' style={{ display: 'none' }} className='w-72 h-28 ' />

        {/* Underline below signature */}
        <div className='border-b border-primary-foreground/30 print:border-black/40 w-72' />

        {/* Clear button */}
        {!isEmpty && (
          <button
            onClick={handleClear}
            className='text-xs text-primary-foreground/50 hover:text-primary-foreground underline print:hidden'
          >
            Clear signature
          </button>
        )}
      </div>
    </div>
  )
}

export default InvoiceSignature
