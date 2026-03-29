'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'

export interface CertificateSignatureHandle {
  getSignatureDataUrl: () => string | null
}

interface Props {
  onSignedChange: (signed: boolean) => void
  readOnly?: boolean
  date?: string
  initialSignature?: string | null
}

const CertificateSignature = forwardRef<CertificateSignatureHandle, Props>(
  ({ onSignedChange, readOnly = false, date, initialSignature }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padRef = useRef<SignaturePad | null>(null)
    const [isEmpty, setIsEmpty] = useState(true)
    const [ready, setReady] = useState(false)

    const displayDate = (() => {
      if (date) return date

      const d = new Date()

      return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
    })()

    useImperativeHandle(ref, () => ({
      getSignatureDataUrl: (): string | null => {
        const canvas = canvasRef.current
        const pad = padRef.current

        if (!pad || pad.isEmpty() || !canvas) return null

        return canvas.toDataURL('image/png')
      }
    }))

    const resizeCanvas = () => {
      const canvas = canvasRef.current

      if (!canvas || !padRef.current) return
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const data = padRef.current.toData()

      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(ratio, ratio)
      padRef.current.clear()
      padRef.current.fromData(data)
    }

    useEffect(() => {
      const canvas = canvasRef.current

      if (!canvas) return

      const pad = new SignaturePad(canvas, {
        penColor: 'black',
        backgroundColor: 'white'
      })

      padRef.current = pad
      resizeCanvas()
      setReady(true)

      if (readOnly) {
        onSignedChange(true)
        pad.off()

        return () => {
          window.removeEventListener('resize', resizeCanvas)
        }
      }

      const handleEnd = () => {
        setIsEmpty(pad.isEmpty())
        onSignedChange(!pad.isEmpty())
      }

      pad.addEventListener('endStroke', handleEnd)
      window.addEventListener('resize', resizeCanvas)

      return () => {
        pad.off()
        window.removeEventListener('resize', resizeCanvas)
      }
    }, [])

    const handleClear = () => {
      padRef.current?.clear()
      setIsEmpty(true)
      onSignedChange(false)
    }

    return (
      <div className='my-6 text-sm text-black'>
        <div className='flex flex-wrap gap-10 items-end'>
          {/* Signature canvas */}
          <div className='space-y-1'>
            <div className='relative w-72'>
              {readOnly && initialSignature ? (
                <img
                  src={
                    initialSignature.startsWith('data:')
                      ? initialSignature
                      : `data:image/png;base64,${initialSignature}`
                  }
                  alt='Signature'
                  className='w-72 h-28 rounded object-contain bg-white'
                />
              ) : (
                <>
                  {ready && isEmpty && !readOnly && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <span className='text-[#9ca3af] italic text-sm'>Click here to sign.</span>
                    </div>
                  )}
                  {readOnly && isEmpty && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <span className='text-[#9ca3af] italic text-sm'>No signature provided.</span>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    style={{ touchAction: 'none', backgroundColor: 'white' }}
                    className={`w-72 h-28 rounded ${readOnly ? 'pointer-events-none opacity-70 cursor-default' : 'cursor-crosshair'}`}
                  />
                </>
              )}
            </div>
            <div className='border-b border-[rgba(0,0,0,0.4)] w-72' />
            <p className='text-sm font-medium'>Signature</p>
            {!readOnly && !isEmpty && (
              <button
                onClick={handleClear}
                className='text-xs text-[rgba(0,0,0,0.5)] hover:text-black underline print:hidden'
              >
                Clear signature
              </button>
            )}
          </div>

          {/* Date */}
          <div className='space-y-1'>
            <p className='text-sm text-[rgba(0,0,0,0.7)]'>{displayDate}</p>
            <div className='border-b border-[rgba(0,0,0,0.4)] w-48' />
            <p className='text-sm font-medium'>Date</p>
          </div>
        </div>
      </div>
    )
  }
)

CertificateSignature.displayName = 'CertificateSignature'

export default CertificateSignature
