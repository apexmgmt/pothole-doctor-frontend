'use client'

import { useEffect } from 'react'

export function ErrorLogger() {
  useEffect(() => {
    const handleUncaught = (e: ErrorEvent) => {
      // ResizeObserver loop errors are benign browser quirks triggered by
      // dropdown/popover components during resize observation cycles
      if (e.message?.includes('ResizeObserver')) return

      alert('Uncaught Error: ' + e.message + '\n' + e.filename + ':' + e.lineno)
    }

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      alert('Unhandled Promise Rejection: ' + (e.reason?.message || String(e.reason)))
    }

    window.addEventListener('error', handleUncaught)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleUncaught)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
