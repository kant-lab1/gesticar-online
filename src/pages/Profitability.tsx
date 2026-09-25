import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { activeStock, useAppState } from '@/store/store'
import { costTotal, marginPct, money, percent, profit, vehicleLabel } from '@/lib/utils'
import type { Sale } from '@/types'

function saleProfit(s: Sale) {
  return s.salePrice - s.purchasePrice - s.expensesTotal
}

function saleMargin(s: Sale) {
  if (s.salePrice <= 0) return 0
  return (saleProfit(s) / s.salePrice) * 100
}

export default function Profitability() {
  const { sales, vehicles } = useAppState()
  const stock = activeStock(vehicles)

  const rankedSales = useMemo(
    () =>
      [...sales]
        .map((s) => ({
          ...s,
          p: saleProfit(s),
          m: saleMargin(s),
          label: `${s.brand} ${s.model} ${s.version}`,
        }))
        .sort((a, b) => b.p - a.p),
    [sales],
  )

  const most = rankedSales.slice(0, 8)
  const least = [...rankedSales].reverse().slice(0, 8)

  const potential = useMemo(
    () =>
      [...stock]
        .map((v) => ({
          v,
          p: profit(v),
          m: marginPct(v),
          cost: costTotal(v),
        }))
        .sort((a, b) => b.p - a.p),
    [stock],
  )

  const totalSoldProfit = rankedSales.reduce((a, s) => a + s.p, 0)
  const totalPotential = potential.reduce((a, x) => a + x.p, 0)

  return (
    <div>
      <PageHeader
        title="Rentabilidad"
        description="Ranking de operaciones cerradas y potencial del stock"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Beneficio histórico" value={money(totalSoldProfit)} />
        <MetricCard label="Mejor operación" value={money(most[0]?.p ?? 0)} hint={most[0]?.label} />
        <MetricCard label="Peor operación" value={money(least[0]?.p ?? 0)} hint={least[0]?.label} />
        <MetricCard label="Potencial stock" value={money(totalPotential)} hint={`${stock.length} uds`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Más rentables (vendidos)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {most.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    #{i + 1} {s.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.code} · {money(s.salePrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-700">{money(s.p)}</p>
                  <p className="text-xs text-slate-500">{percent(s.m)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menos rentables (vendidos)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {least.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    #{i + 1} {s.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.code} · {money(s.salePrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${s.p >= 0 ? 'text-amber-700' : 'text-rose-600'}`}>
                    {money(s.p)}
                  </p>
                  <p className="text-xs text-slate-500">{percent(s.m)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Potencial de margen en stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Vehículo</th>
                    <th>Coste</th>
                    <th>PVP</th>
                    <th>Beneficio pot.</th>
                    <th>Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {potential.map(({ v, p, m, cost }) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="py-2.5">
                        <Link
                          to={`/vehiculos/${v.id}`}
                          className="font-semibold hover:underline"
                        >
                          {vehicleLabel(v)}
                        </Link>
                      </td>
                      <td>{money(cost)}</td>
                      <td>{money(v.listPrice)}</td>
                      <td className="font-semibold text-emerald-700">{money(p)}</td>
                      <td>{percent(m)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
