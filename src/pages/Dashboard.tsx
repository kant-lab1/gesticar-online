import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/input'
import { MetricCard } from '@/components/shared/primitives'
import { DEALERSHIP, DEMO_USER } from '@/config/app'
import { activeStock, useAppState } from '@/store/store'
import {
  costTotal,
  daysInStock,
  money,
  percent,
  profit,
  relativeES,
  vehicleLabel,
} from '@/lib/utils'

const CHART = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#cbd5e1', '#38bdf8', '#10b981', '#f59e0b']
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function monthKey(iso: string) {
  return iso.slice(0, 7)
}

export default function Dashboard() {
  const state = useAppState()
  const [period, setPeriod] = useState('mes')
  const stock = useMemo(() => activeStock(state.vehicles), [state.vehicles])
  const monthSales = useMemo(
    () => state.sales.filter((s) => s.saleDate.startsWith('2026-08')),
    [state.sales],
  )

  const stockValue = stock.reduce((s, v) => s + costTotal(v), 0)
  const stockList = stock.reduce((s, v) => s + v.listPrice, 0)
  const potential = stock.reduce((s, v) => s + profit(v), 0)
  const monthRevenue = monthSales.reduce((s, x) => s + x.salePrice, 0)
  const monthProfit = monthSales.reduce(
    (s, x) => s + (x.salePrice - x.purchasePrice - x.expensesTotal),
    0,
  )
  const avgDays =
    stock.length === 0
      ? 0
      : Math.round(stock.reduce((s, v) => s + daysInStock(v.purchaseDate), 0) / stock.length)

  const salesChart = useMemo(() => {
    const keys: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(2026, 7 - i, 1)
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return keys.map((key) => {
      const rows = state.sales.filter((s) => monthKey(s.saleDate) === key)
      const [, m] = key.split('-')
      return {
        label: MONTH_LABELS[Number(m) - 1],
        key,
        ventas: rows.length,
        facturacion: rows.reduce((s, x) => s + x.salePrice, 0),
        beneficio: rows.reduce((s, x) => s + (x.salePrice - x.purchasePrice - x.expensesTotal), 0),
      }
    })
  }, [state.sales])

  const ageDist = useMemo(() => {
    const buckets = [
      { name: '0–30', value: 0 },
      { name: '31–60', value: 0 },
      { name: '61–90', value: 0 },
      { name: '+90', value: 0 },
    ]
    stock.forEach((v) => {
      const d = daysInStock(v.purchaseDate)
      if (d <= 30) buckets[0].value++
      else if (d <= 60) buckets[1].value++
      else if (d <= 90) buckets[2].value++
      else buckets[3].value++
    })
    return buckets
  }, [stock])

  const byBrand = useMemo(() => {
    const map = new Map<string, number>()
    stock.forEach((v) => map.set(v.brand, (map.get(v.brand) ?? 0) + 1))
    return [...map.entries()]
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [stock])

  const attention = [
    {
      to: '/vehiculos/v01',
      title: 'BMW Serie 3 · 90+ días',
      detail: 'Lleva más de 90 días en stock. Revisar precio.',
    },
    {
      to: '/vehiculos/v03',
      title: 'Audi A3 · ITV pendiente',
      detail: 'Documentación ITV caduca pronto.',
    },
    {
      to: '/vehiculos/v11',
      title: 'Peugeot 3008 · Preparación',
      detail: 'Tareas de neumáticos, fotos y publicación abiertas.',
    },
    {
      to: '/vehiculos/v05',
      title: 'Mercedes Clase A · Sin publicar',
      detail: 'Disponible pero no está en la web.',
    },
  ]

  const firstName = DEMO_USER.name.split(' ')[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900">
            Buenos días, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {DEALERSHIP.name} · Resumen operativo · 11 ago 2026
          </p>
        </div>
        <div className="w-44">
          <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="mes">Este mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="año">Año</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard label="Stock activo" value={String(stock.length)} hint="vehículos" />
        <MetricCard label="Inversión stock" value={money(stockValue)} hint={`PVP ${money(stockList)}`} />
        <MetricCard
          label="Ventas del mes"
          value={String(monthSales.length)}
          hint={period === 'mes' ? 'agosto 2026' : period}
        />
        <MetricCard label="Facturación mes" value={money(monthRevenue)} trend={{ value: 'mes actual', up: true }} />
        <MetricCard
          label="Beneficio mes"
          value={money(monthProfit)}
          hint={monthRevenue ? percent((monthProfit / monthRevenue) * 100) : undefined}
        />
        <MetricCard
          label="Días medios stock"
          value={`${avgDays}`}
          hint={`Potencial ${money(potential)}`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas mensuales</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'facturacion'
                      ? [money(Number(value)), 'Facturación']
                      : [value, 'Ventas']
                  }
                />
                <Bar yAxisId="left" dataKey="ventas" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="facturacion" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beneficio mensual</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => money(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="beneficio"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Antigüedad del stock</CardTitle>
          </CardHeader>
          <CardContent className="grid h-72 grid-cols-2 gap-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ageDist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {ageDist.map((_, i) => (
                    <Cell key={i} fill={CHART[i % CHART.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDist} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={48} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#334155" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock por marca</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byBrand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="brand" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[4, 4, 0, 0]} name="Unidades" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Requiere atención
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.activity.slice(0, 8).map((a) => (
              <div key={a.id} className="flex gap-3 border-b border-slate-50 pb-2 last:border-0">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">
                    {a.vehicleId ? (
                      <Link to={`/vehiculos/${a.vehicleId}`} className="hover:underline">
                        {a.text}
                      </Link>
                    ) : (
                      a.text
                    )}
                  </p>
                  <p className="text-xs text-slate-400">{relativeES(a.at)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-400">
        Stock disponible ahora: {stock.map((v) => vehicleLabel(v)).slice(0, 3).join(' · ')}
        {stock.length > 3 ? ` · +${stock.length - 3} más` : ''}
      </p>
    </div>
  )
}
