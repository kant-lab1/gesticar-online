import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  en_preparacion: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  reservado: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  vendido: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  pendiente_documentacion: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  taller: 'bg-orange-50 text-orange-700 ring-orange-600/15',
  ok: 'bg-slate-100 text-slate-600 ring-slate-500/10',
  warn: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  alert: 'bg-orange-50 text-orange-700 ring-orange-600/15',
  critical: 'bg-rose-50 text-rose-700 ring-rose-600/15',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  muted: 'bg-slate-100 text-slate-500 ring-slate-500/10',
}

const labels: Record<string, string> = {
  disponible: 'Disponible',
  en_preparacion: 'En preparación',
  reservado: 'Reservado',
  vendido: 'Vendido',
  pendiente_documentacion: 'Pendiente documentación',
  taller: 'Taller',
}

export function Badge({
  children,
  tone = 'muted',
  className,
}: {
  children?: React.ReactNode
  tone?: keyof typeof styles | string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset',
        styles[tone] ?? styles.muted,
        className,
      )}
    >
      {children ?? labels[tone] ?? tone}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status}>{labels[status] ?? status}</Badge>
}
