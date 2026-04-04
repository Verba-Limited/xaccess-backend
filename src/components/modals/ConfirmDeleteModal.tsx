import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  /** Called when user confirms; may be async */
  onConfirm: () => void | Promise<void>
  /** Defaults to design copy */
  message?: string
  /** Defaults to "Yes, Delete" */
  confirmLabel?: string
}

/**
 * Matches `admin backend web design/Delete Confirm.png`
 */
export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  message = 'Are you sure you want to delete this item?',
  confirmLabel = 'Yes, Delete',
}: Props) {
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setBusy(false)
  }, [open])

  async function handleConfirm() {
    setBusy(true)
    try {
      await Promise.resolve(onConfirm())
    } finally {
      setBusy(false)
    }
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      role="presentation"
      onClick={() => {
        if (!busy) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="delete-confirm-title" className="text-xl font-bold text-gray-900">
          {message}
        </p>
        <button
          type="button"
          disabled={busy}
          className="mt-6 w-full rounded-lg bg-red-600 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60"
          onClick={() => void handleConfirm()}
        >
          {busy ? 'Please wait…' : confirmLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          className="mt-4 w-full text-center text-base font-medium text-brand hover:underline disabled:opacity-50"
          onClick={() => {
            if (!busy) onClose()
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  )
}
