import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { useAppState } from '@/store/store'
import { dateES, vehicleLabel } from '@/lib/utils'
import type { DocStatus } from '@/types'

type FlatDoc = {
  id: string
  vehicleId: string
  vehicleLabel: string
  name: string
  status: DocStatus
  expiresAt?: string
  updatedAt?: string
}

export default function Documents() {
  const { vehicles } = useAppState()

  const docs = useMemo(() => {
    const rows: FlatDoc[] = []
    vehicles.forEach((v) => {
      v.documents.forEach((d) => {
        rows.push({
          id: `${v.id}-${d.id}`,
          vehicleId: v.id,
          vehicleLabel: vehicleLabel(v),
          name: d.name,
          status: d.status,
          expiresAt: d.expiresAt,
          updatedAt: d.updatedAt,
        })
      })
    })
    return rows.sort((a, b) => {
      const order = { caducado: 0, pendiente: 1, correcto: 2 }
      return order[a.status] - order[b.status]
    })
  }, [vehicles])

  const pending = docs.filter((d) => d.status === 'pendiente').length
  const expired = docs.filter((d) => d.status === 'caducado').length
  const ok = docs.filter((d) => d.status === 'correcto').length

  return (
    <div>
      <PageHeader
        title="Documentos"
        description="Documentación agregada de todo el inventario"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total docs" value={String(docs.length)} />
        <MetricCard label="Correctos" value={String(ok)} />
        <MetricCard label="Pendientes" value={String(pending)} />
        <MetricCard label="Caducados" value={String(expired)} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Documento</th>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
                <th className="px-3 py-3 font-semibold">Caducidad</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-slate-50">
                  <td className="px-3 py-2.5 font-medium">{d.name}</td>
                  <td className="px-3 py-2.5">
                    <Link to={`/vehiculos/${d.vehicleId}`} className="hover:underline">
                      {d.vehicleLabel}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      tone={
                        d.status === 'correcto'
                          ? 'success'
                          : d.status === 'caducado'
                            ? 'critical'
                            : 'warn'
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {d.expiresAt ? dateES(d.expiresAt) : '—'}
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
