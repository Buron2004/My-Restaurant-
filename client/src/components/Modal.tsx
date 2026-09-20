import type { ReactNode } from 'react'

interface Props {
  onClose: () => void
  children: ReactNode
  labelledBy?: string
  maxWidthClassName?: string
}

export function Modal({ onClose, children, labelledBy, maxWidthClassName = 'max-w-2xl' }: Props) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={`max-h-[92vh] w-full ${maxWidthClassName} overflow-y-auto rounded-2xl bg-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        {children}
      </section>
    </div>
  )
}