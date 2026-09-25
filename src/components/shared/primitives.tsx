import { cn, money, percent, stockAgeLevel } from '@/lib/utils'
import { vehicleImage } from '@/lib/vehicleImage'

export function MetricCard({
  label,
  value,
  hint,
  trend,
  className,
}: {
  label: string
  value: string
  hint?: string
  trend?: { value: string; up?: boolean }
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              'font-semibold',
              trend.up === false ? 'text-rose-600' : 'text-emerald-600',
            )}
          >
            {trend.up === false ? '↓' : '↑'} {trend.value}
          </span>
        )}
        {hint && <span className="text-slate-500">{hint}</span>}
      </div>
    </div>
  )
}

export function StockAgeBadge({ days }: { days: number }) {
  const level = stockAgeLevel(days)
  const map = {
    ok: 'text-slate-600 bg-slate-100',
    warn: 'text-amber-700 bg-amber-50',
    alert: 'text-orange-700 bg-orange-50',
    critical: 'text-rose-700 bg-rose-50',
  } as const
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-semibold', map[level])}>
      {days} días
    </span>
  )
}

export function ProfitabilityInline({
  cost,
  price,
  profitValue,
  margin,
}: {
  cost: number
  price: number
  profitValue: number
  margin: number
}) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex justify-between text-slate-500">
        <span>Coste</span>
        <span>{money(cost)}</span>
      </div>
      <div className="flex justify-between text-slate-500">
        <span>PVP</span>
        <span>{money(price)}</span>
      </div>
      <div className="flex justify-between font-semibold text-slate-900">
        <span>Margen</span>
        <span className={profitValue >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
          {money(profitValue)} · {percent(margin)}
        </span>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function VehicleImage({
  brand,
  model,
  className,
  src,
}: {
  brand: string
  model: string
  className?: string
  src?: string
}) {
  const photo = src || vehicleImage(brand, model)
  const hue =
    Math.abs([...`${brand}${model}`].reduce((a, c) => a + c.charCodeAt(0), 0)) % 360

  if (photo) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg bg-slate-200', className)}>
        <img
          src={photo}
          alt={`${brand} ${model}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex items-end overflow-hidden rounded-lg bg-slate-100',
        className,
      )}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 28% 88%), hsl(${(hue + 40) % 360} 22% 78%))`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, white 0, transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,.5), transparent 35%)',
        }}
      />
      <div className="relative p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600/80">
          {brand}
        </p>
        <p className="text-sm font-bold text-slate-800">{model}</p>
      </div>
    </div>
  )
}
