import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Globe } from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MetricCard, PageHeader, VehicleImage } from '@/components/shared/primitives'
import { activeStock, syncWeb, toggleWebPublication, useAppState } from '@/store/store'
import { money, relativeES, vehicleLabel } from '@/lib/utils'

export default function WebChannel() {
  const { vehicles } = useAppState()
  const stock = useMemo(() => activeStock(vehicles), [vehicles])
  const [busy, setBusy] = useState<string | null>(null)

  const published = stock.filter((v) => v.publication.web)
  const unpublished = stock.filter((v) => !v.publication.web && v.status === 'disponible')

  function publish(id: string, on: boolean) {
    setBusy(id)
    setTimeout(() => {
      toggleWebPublication(id, on)
      syncWeb(id)
      setBusy(null)
      toast.success(on ? 'Publicado en la web' : 'Retirado de la web')
    }, 600)
  }

  function sync(id: string) {
    setBusy(id)
    setTimeout(() => {
      syncWeb(id)
      setBusy(null)
      toast.success('Sincronizado')
    }, 500)
  }

  return (
    <div>
      <PageHeader
        title="Página web"
        description="Gestión de publicaciones en gesticar.online"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Publicados" value={String(published.length)} />
        <MetricCard label="Pendientes" value={String(unpublished.length)} hint="disponibles sin web" />
        <MetricCard label="Stock activo" value={String(stock.length)} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">PVP</th>
                <th className="px-3 py-3 font-semibold">Web</th>
                <th className="px-3 py-3 font-semibold">Última sync</th>
                <th className="px-3 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((v) => (
                <tr key={v.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <VehicleImage brand={v.brand} model={v.model} className="h-10 w-14" />
                      <div>
                        <Link to={`/vehiculos/${v.id}`} className="font-semibold hover:underline">
                          {vehicleLabel(v)}
                        </Link>
                        <p className="text-xs text-slate-500">{v.plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{money(v.listPrice)}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={v.publication.web ? 'success' : 'muted'}>
                      {v.publication.web ? 'Publicado' : 'No publicado'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-500">
                    {v.publication.lastSyncAt ? relativeES(v.publication.lastSyncAt) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      {v.publication.web ? (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy === v.id}
                          onClick={() => publish(v.id, false)}
                        >
                          Despublicar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={busy === v.id || v.status === 'vendido'}
                          onClick={() => publish(v.id, true)}
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Publicar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy === v.id}
                        onClick={() => sync(v.id)}
                      >
                        Sync
                      </Button>
                    </div>
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
