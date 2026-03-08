'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'

export interface InvoiceSignatureHandle {
  prepareForExport: () => void
  restoreAfterExport: () => void
  getSignatureBlob: () => Promise<Blob | null>
  getSignatureDataUrl: () => string | null
}

interface Props {
  onSignedChange: (signed: boolean) => void
  onAgreedChange: (agreed: boolean) => void
  readOnly?: boolean
  initialAgreed?: boolean
}

const InvoiceSignature = forwardRef<InvoiceSignatureHandle, Props>(
  ({ onSignedChange, onAgreedChange, readOnly = false, initialAgreed = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const padRef = useRef<SignaturePad | null>(null)
    const [agreed, setAgreed] = useState(initialAgreed)
    const [isEmpty, setIsEmpty] = useState(true)
    const [ready, setReady] = useState(false)

    useImperativeHandle(ref, () => ({
      // No-ops: canvas already has white bg + black strokes (light theme default)
      prepareForExport: () => {},
      restoreAfterExport: () => {},
      getSignatureBlob: (): Promise<Blob | null> => {
        return new Promise(resolve => {
          const canvas = canvasRef.current
          const pad = padRef.current

          if (!pad || pad.isEmpty() || !canvas) return resolve(null)
          canvas.toBlob(blob => resolve(blob), 'image/png')
        })
      },
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
        // Notify parent the form was previously completed
        onSignedChange(true)
        onAgreedChange(initialAgreed)
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

    const handleAgreedChange = (checked: boolean) => {
      setAgreed(checked)
      onAgreedChange(checked)
    }

    return (
      <div className='my-6 text-sm text-black'>
        <h3 className='text-base font-semibold mb-4 bg-[#f3f4f6] px-3 py-2 rounded'>Signature</h3>

        <div className='space-y-4'>
          <label className={`flex items-center gap-2 select-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
            <input
              type='checkbox'
              checked={agreed}
              onChange={e => !readOnly && handleAgreedChange(e.target.checked)}
              disabled={readOnly}
              className='w-4 h-4 accent-[#3ecf6d]'
            />
            <span className='text-sm text-black'>I have read and agree to the terms in the customer agreement.</span>
          </label>

          <div className='relative w-72'>
            {ready && isEmpty && !readOnly && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <span className='text-[#9ca3af] italic text-sm'>Click here to sign.</span>
              </div>
            )}
            {readOnly && isEmpty && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <span className='text-[#9ca3af] italic text-sm'>Signature on file.</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              style={{ touchAction: 'none', backgroundColor: 'white' }}
              className={`w-72 h-28 rounded ${readOnly ? 'pointer-events-none opacity-70 cursor-default' : 'cursor-crosshair'}`}
            />
          </div>

          <div className='border-b border-[rgba(0,0,0,0.4)] w-72' />

          {!readOnly && !isEmpty && (
            <button
              onClick={handleClear}
              className='text-xs text-[rgba(0,0,0,0.5)] hover:text-black underline print:hidden'
            >
              Clear signature
            </button>
          )}
        </div>
      </div>
    )
  }
)

InvoiceSignature.displayName = 'InvoiceSignature'

export default InvoiceSignature
