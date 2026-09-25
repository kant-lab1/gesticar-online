import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { activeStock, syncWeb, toggleWebPublication, updateVehicle, useAppState } from '@/store/store'
import { vehicleLabel } from '@/lib/utils'
import type { PublicationState, Vehicle } from '@/types'

const CHANNELS: { key: keyof Pick<PublicationState, 'web' | 'autoscout24' | 'cochesNet' | 'wallapop' | 'facebook'>; label: string }[] = [
  { key: 'web', label: 'Web' },
  { key: 'autoscout24', label: 'AutoScout24' },
  { key: 'cochesNet', label: 'Coches.net' },
  { key: 'wallapop', label: 'Wallapop' },
  { key: 'facebook', label: 'Facebook' },
]

export default function Publications() {
  const { vehicles } = useAppState()
  const stock = useMemo(() => activeStock(vehicles), [vehicles])

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    CHANNELS.forEach((c) => {
      t[c.key] = stock.filter((v) => v.publication[c.key]).length
    })
    return t
  }, [stock])

  function toggleChannel(v: Vehicle, key: (typeof CHANNELS)[number]['key']) {
    const next = !v.publication[key]
    if (key === 'web') {
      toggleWebPublication(v.id, next)
      toast.success(next ? 'Web activada' : 'Web desactivada')
      return
    }
    updateVehicle(v.id, {
      publication: {
        ...v.publication,
        [key]: next,
        lastSyncAt: new Date().toISOString(),
      },
    })
    toast.success(`${CHANNELS.find((c) => c.key === key)?.label} ${next ? 'activado' : 'desactivado'}`)
  }

  function syncAll(v: Vehicle) {
    syncWeb(v.id)
    toast.success(`Canales sincronizados · ${vehicleLabel(v)}`)
  }

  return (
    <div>
      <PageHeader
        title="Publicaciones"
        description="Matriz de canales de anuncio por vehículo"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {CHANNELS.map((c) => (
          <MetricCard key={c.key} label={c.label} value={String(totals[c.key] ?? 0)} hint="activos" />
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                {CHANNELS.map((c) => (
                  <th key={c.key} className="px-3 py-3 text-center font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-3 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((v) => (
                <tr key={v.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5">
                    <Link to={`/vehiculos/${v.id}`} className="font-semibold hover:underline">
                      {vehicleLabel(v)}
                    </Link>
                    <p className="text-xs text-slate-500">{v.plate}</p>
                  </td>
                  {CHANNELS.map((c) => (
                    <td key={c.key} className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => toggleChannel(v, c.key)}
                        className="inline-flex"
                      >
                        <Badge tone={v.publication[c.key] ? 'success' : 'muted'}>
                          {v.publication[c.key] ? 'ON' : 'OFF'}
                        </Badge>
                      </button>
                    </td>
                  ))}
                  <td className="px-3 py-2.5">
                    <Button size="sm" variant="secondary" onClick={() => syncAll(v)}>
                      Sync
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
