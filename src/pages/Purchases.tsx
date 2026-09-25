import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MetricCard, PageHeader, StockAgeBadge } from '@/components/shared/primitives'
import { activeStock, useAppState } from '@/store/store'
import { dateES, daysInStock, expensesTotal, money, vehicleLabel } from '@/lib/utils'

export default function Purchases() {
  const { vehicles } = useAppState()
  const stock = useMemo(() => activeStock(vehicles), [vehicles])

  const rows = useMemo(
    () =>
      [...stock].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)),
    [stock],
  )

  const invested = rows.reduce((a, v) => a + v.purchasePrice, 0)
  const expenses = rows.reduce((a, v) => a + expensesTotal(v.expenses), 0)

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Entradas de stock tratadas como compras de vehículos"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Compras activas" value={String(rows.length)} />
        <MetricCard label="Inversión compra" value={money(invested)} />
        <MetricCard label="Gastos post-compra" value={money(expenses)} />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                <th className="px-3 py-3 font-semibold">Matrícula</th>
                <th className="px-3 py-3 font-semibold">Proveedor</th>
                <th className="px-3 py-3 font-semibold">Origen</th>
                <th className="px-3 py-3 font-semibold">Precio compra</th>
                <th className="px-3 py-3 font-semibold">Gastos</th>
                <th className="px-3 py-3 font-semibold">Días</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-3 py-2.5">{dateES(v.purchaseDate)}</td>
                  <td className="px-3 py-2.5">
                    <Link to={`/vehiculos/${v.id}`} className="font-semibold hover:underline">
                      {vehicleLabel(v)}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{v.plate}</td>
                  <td className="px-3 py-2.5">{v.supplier}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone="muted">{v.origin}</Badge>
                  </td>
                  <td className="px-3 py-2.5 font-semibold">{money(v.purchasePrice)}</td>
                  <td className="px-3 py-2.5">{money(expensesTotal(v.expenses))}</td>
                  <td className="px-3 py-2.5">
                    <StockAgeBadge days={daysInStock(v.purchaseDate)} />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={v.status} />
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
