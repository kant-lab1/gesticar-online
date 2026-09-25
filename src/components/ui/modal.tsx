import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 max-h-[90vh] w-full overflow-auto rounded-2xl border border-slate-200 bg-white shadow-xl',
          wide ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
