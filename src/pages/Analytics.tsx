import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/input'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { activeStock, useAppState } from '@/store/store'
import { daysInStock, money, percent } from '@/lib/utils'
import type { Sale } from '@/types'

function saleProfit(s: Sale) {
  return s.salePrice - s.purchasePrice - s.expensesTotal
}

export default function Analytics() {
  const { sales, vehicles } = useAppState()
  const [period, setPeriod] = useState<'mes' | 'trimestre' | 'año' | 'todo'>('todo')

  const filtered = useMemo(() => {
    if (period === 'todo') return sales
    if (period === 'mes') return sales.filter((s) => s.saleDate.startsWith('2026-08'))
    if (period === 'trimestre')
      return sales.filter((s) => {
        const m = Number(s.saleDate.slice(5, 7))
        const y = Number(s.saleDate.slice(0, 4))
        return y === 2026 && m >= 6 && m <= 8
      })
    return sales.filter((s) => s.saleDate.startsWith('2026'))
  }, [sales, period])

  const stock = activeStock(vehicles)
  const revenue = filtered.reduce((a, s) => a + s.salePrice, 0)
  const profit = filtered.reduce((a, s) => a + saleProfit(s), 0)
  const avgDays =
    filtered.length === 0
      ? 0
      : Math.round(filtered.reduce((a, s) => a + s.daysInStock, 0) / filtered.length)
  const rotation =
    stock.length === 0
      ? 0
      : filtered.length / Math.max(1, stock.length / 12)

  const brandPerf = useMemo(() => {
    const map = new Map<
      string,
      { brand: string; ventas: number; facturacion: number; beneficio: number; dias: number }
    >()
    filtered.forEach((s) => {
      const cur = map.get(s.brand) ?? {
        brand: s.brand,
        ventas: 0,
        facturacion: 0,
        beneficio: 0,
        dias: 0,
      }
      cur.ventas++
      cur.facturacion += s.salePrice
      cur.beneficio += saleProfit(s)
      cur.dias += s.daysInStock
      map.set(s.brand, cur)
    })
    return [...map.values()]
      .map((r) => ({
        ...r,
        margen: r.facturacion ? (r.beneficio / r.facturacion) * 100 : 0,
        diasMedios: r.ventas ? Math.round(r.dias / r.ventas) : 0,
      }))
      .sort((a, b) => b.beneficio - a.beneficio)
  }, [filtered])

  const stockAge = useMemo(() => {
    const buckets = [
      { name: '0–30', count: 0 },
      { name: '31–60', count: 0 },
      { name: '61–90', count: 0 },
      { name: '+90', count: 0 },
    ]
    stock.forEach((v) => {
      const d = daysInStock(v.purchaseDate)
      if (d <= 30) buckets[0].count++
      else if (d <= 60) buckets[1].count++
      else if (d <= 90) buckets[2].count++
      else buckets[3].count++
    })
    return buckets
  }, [stock])

  return (
    <div>
      <PageHeader
        title="Analítica"
        description="Rendimiento comercial y rotación de stock"
        actions={
          <Select className="w-44" value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
            <option value="mes">Este mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="año">Año 2026</option>
            <option value="todo">Todo el histórico</option>
          </Select>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Ventas" value={String(filtered.length)} />
        <MetricCard label="Facturación" value={money(revenue)} />
        <MetricCard
          label="Beneficio"
          value={money(profit)}
          hint={revenue ? percent((profit / revenue) * 100) : undefined}
        />
        <MetricCard label="Días medios venta" value={String(avgDays)} />
        <MetricCard label="Índice rotación" value={rotation.toFixed(1)} hint="aprox." />
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rotación · antigüedad stock actual</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockAge}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top marcas por beneficio</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandPerf.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Bar dataKey="beneficio" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Rendimiento por marca</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase text-slate-500">
              <tr>
                <th className="py-2">Marca</th>
                <th>Ventas</th>
                <th>Facturación</th>
                <th>Beneficio</th>
                <th>Margen</th>
                <th>Días medios</th>
              </tr>
            </thead>
            <tbody>
              {brandPerf.map((r) => (
                <tr key={r.brand} className="border-t border-slate-100">
                  <td className="py-2.5 font-semibold">{r.brand}</td>
                  <td>{r.ventas}</td>
                  <td>{money(r.facturacion)}</td>
                  <td className="text-emerald-700">{money(r.beneficio)}</td>
                  <td>{percent(r.margen)}</td>
                  <td>{r.diasMedios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
