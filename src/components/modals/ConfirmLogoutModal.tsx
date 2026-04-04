import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * Matches `admin backend web design/Logout Confirm.png`
 */
export function ConfirmLogoutModal({ open, onClose, onConfirm }: Props) {
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

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/95 px-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        className="w-full max-w-sm rounded-xl bg-white p-10 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="logout-confirm-title" className="text-lg font-bold text-gray-900">
          Are you sure you want to logout your account?
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-lg bg-brand py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
          onClick={onConfirm}
        >
          Yes, Logout
        </button>
        <button
          type="button"
          className="mt-4 w-full text-center text-base font-bold text-brand hover:underline"
          onClick={onClose}
        >
          Cancel
        </button>
        <div className="mt-6 border-t border-gray-100" aria-hidden />
      </div>
    </div>,
    document.body,
  )
}
