import { Bell, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEMO_USER } from '@/config/app'
import { Input } from '@/components/ui/input'
import { useAppState } from '@/store/store'
import { daysInStock, vehicleLabel } from '@/lib/utils'

export function Topbar() {
  const { vehicles, leads } = useAppState()
  const [q, setQ] = useState('')
  const [openNotif, setOpenNotif] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)

  const notifications = useMemo(() => {
    const stock = vehicles.filter((v) => v.status !== 'vendido')
    const old = stock.filter((v) => daysInStock(v.purchaseDate) > 90)
    const itv = stock.filter((v) =>
      v.documents.some((d) => d.name === 'ITV' && d.status === 'pendiente'),
    )
    const unpublished = stock.filter((v) => !v.publication.web && v.status === 'disponible')
    const newLeads = leads.filter((l) => l.status === 'nuevo')
    return [
      old.length
        ? `${old.length} vehículos llevan más de 90 días en stock.`
        : null,
      itv[0]
        ? `ITV del ${vehicleLabel(itv[0])} pendiente.`
        : null,
      newLeads[0]
        ? `Nuevo lead interesado en ${newLeads[0].vehicleLabel}.`
        : null,
      unpublished[0]
        ? `${vehicleLabel(unpublished[0])} pendiente de publicar.`
        : null,
    ].filter(Boolean) as string[]
  }, [vehicles, leads])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const term = q.toLowerCase()
    return vehicles
      .filter((v) =>
        `${v.brand} ${v.model} ${v.plate} ${v.vin}`.toLowerCase().includes(term),
      )
      .slice(0, 6)
  }, [q, vehicles])

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-5 backdrop-blur">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar matrícula, marca, modelo…  ⌘K"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpenSearch(true)
          }}
          onFocus={() => setOpenSearch(true)}
          onBlur={() => setTimeout(() => setOpenSearch(false), 150)}
        />
        {openSearch && results.length > 0 && (
          <div className="absolute left-0 right-0 top-10 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {results.map((v) => (
              <Link
                key={v.id}
                to={`/vehiculos/${v.id}`}
                className="block px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="font-semibold">{vehicleLabel(v)}</span>
                <span className="ml-2 text-slate-500">{v.plate}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-600/15">
        Entorno demo
      </span>

      <div className="relative">
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
          onClick={() => setOpenNotif((v) => !v)}
        >
          <Bell className="h-4 w-4 text-slate-600" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {notifications.length}
            </span>
          )}
        </button>
        {openNotif && (
          <div className="absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
              Notificaciones
            </div>
            {notifications.map((n) => (
              <p key={n} className="border-b border-slate-50 px-3 py-2.5 text-sm text-slate-700">
                {n}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
          {DEMO_USER.initials}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-semibold leading-tight">{DEMO_USER.name}</p>
          <p className="text-[10px] text-slate-500">{DEMO_USER.role}</p>
        </div>
      </div>
    </header>
  )
}
