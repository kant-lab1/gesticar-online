import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { useAppState } from '@/store/store'
import { dateES, money, vehicleLabel } from '@/lib/utils'
import type { ExpenseCategory, VehicleExpense } from '@/types'

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

type FlatExpense = VehicleExpense & { vehicleLabel: string; brand: string; model: string }

export default function Expenses() {
  const { vehicles } = useAppState()

  const flat = useMemo(() => {
    const rows: FlatExpense[] = []
    vehicles.forEach((v) => {
      v.expenses.forEach((e) => {
        rows.push({
          ...e,
          vehicleLabel: vehicleLabel(v),
          brand: v.brand,
          model: v.model,
        })
      })
    })
    return rows.sort((a, b) => b.date.localeCompare(a.date))
  }, [vehicles])

  const total = flat.reduce((a, e) => a + e.amount, 0)

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    flat.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount))
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [flat])

  return (
    <div>
      <PageHeader
        title="Gastos"
        description="Todos los costes operativos asociados a vehículos"
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total gastos" value={money(total)} />
        <MetricCard label="Nº apuntes" value={String(flat.length)} />
        <MetricCard
          label="Categorías"
          value={String(byCategory.length)}
          hint={byCategory[0] ? `Top: ${byCategory[0].name}` : undefined}
        />
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={100} label>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comparativa categorías</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                <th className="px-3 py-3 font-semibold">Concepto</th>
                <th className="px-3 py-3 font-semibold">Categoría</th>
                <th className="px-3 py-3 font-semibold">Proveedor</th>
                <th className="px-3 py-3 font-semibold text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {flat.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-3 py-2.5">{dateES(e.date)}</td>
                  <td className="px-3 py-2.5">
                    <Link to={`/vehiculos/${e.vehicleId}`} className="font-medium hover:underline">
                      {e.vehicleLabel}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">{e.concept}</td>
                  <td className="px-3 py-2.5">{e.category}</td>
                  <td className="px-3 py-2.5">{e.supplier}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{money(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
