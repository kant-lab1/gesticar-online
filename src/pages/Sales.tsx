import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { MetricCard, PageHeader } from '@/components/shared/primitives'
import { useAppState } from '@/store/store'
import { dateES, money, percent } from '@/lib/utils'
import type { Sale } from '@/types'

function saleProfit(s: Sale) {
  return s.salePrice - s.purchasePrice - s.expensesTotal
}

function saleMargin(s: Sale) {
  if (s.salePrice <= 0) return 0
  return (saleProfit(s) / s.salePrice) * 100
}

export default function Sales() {
  const { sales } = useAppState()
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const queryId = id ?? params.get('id')
  const [selected, setSelected] = useState<Sale | null>(null)

  useEffect(() => {
    if (!queryId) {
      setSelected(null)
      return
    }
    setSelected(sales.find((s) => s.id === queryId) ?? null)
  }, [queryId, sales])

  const monthSales = useMemo(
    () => sales.filter((s) => s.saleDate.startsWith('2026-08')),
    [sales],
  )

  const kpis = useMemo(() => {
    const revenue = sales.reduce((a, s) => a + s.salePrice, 0)
    const profit = sales.reduce((a, s) => a + saleProfit(s), 0)
    const avgDays =
      sales.length === 0
        ? 0
        : Math.round(sales.reduce((a, s) => a + s.daysInStock, 0) / sales.length)
    const monthRevenue = monthSales.reduce((a, s) => a + s.salePrice, 0)
    const monthProfit = monthSales.reduce((a, s) => a + saleProfit(s), 0)
    return { revenue, profit, avgDays, monthRevenue, monthProfit }
  }, [sales, monthSales])

  function openSale(s: Sale) {
    setSelected(s)
    navigate(`/ventas/${s.id}`, { replace: true })
  }

  function closeSale() {
    setSelected(null)
    navigate('/ventas', { replace: true })
  }

  return (
    <div>
      <PageHeader
        title="Ventas"
        description={`${sales.length} operaciones registradas · ${monthSales.length} este mes`}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Ventas totales" value={String(sales.length)} />
        <MetricCard label="Facturación" value={money(kpis.revenue)} />
        <MetricCard label="Beneficio" value={money(kpis.profit)} />
        <MetricCard label="Facturación mes" value={money(kpis.monthRevenue)} hint="ago 2026" />
        <MetricCard label="Días medios" value={String(kpis.avgDays)} hint="en stock" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Vehículo</th>
                <th className="px-3 py-3 font-semibold">Matrícula</th>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Comercial</th>
                <th className="px-3 py-3 font-semibold">Precio</th>
                <th className="px-3 py-3 font-semibold">Beneficio</th>
                <th className="px-3 py-3 font-semibold">Margen</th>
                <th className="px-3 py-3 font-semibold">Días</th>
                <th className="px-3 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
                  onClick={() => openSale(s)}
                >
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold">{s.code}</td>
                  <td className="px-3 py-2.5 font-medium">
                    {s.brand} {s.model} {s.version}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs">{s.plate}</td>
                  <td className="px-3 py-2.5">{dateES(s.saleDate)}</td>
                  <td className="px-3 py-2.5">{s.buyerName}</td>
                  <td className="px-3 py-2.5">{s.sellerName}</td>
                  <td className="px-3 py-2.5 font-semibold">{money(s.salePrice)}</td>
                  <td className="px-3 py-2.5 text-emerald-700">{money(saleProfit(s))}</td>
                  <td className="px-3 py-2.5">{percent(saleMargin(s))}</td>
                  <td className="px-3 py-2.5">{s.daysInStock}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={s.status === 'Completada' ? 'success' : 'warn'}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selected}
        onClose={closeSale}
        title={selected ? `Detalle ${selected.code}` : 'Venta'}
        wide
      >
        {selected && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Vehículo" value={`${selected.brand} ${selected.model} ${selected.version}`} />
            <Detail label="Matrícula" value={selected.plate} />
            <Detail label="Cliente" value={selected.buyerName} />
            <Detail label="Comercial" value={selected.sellerName} />
            <Detail label="Fecha venta" value={dateES(selected.saleDate)} />
            <Detail label="Fecha compra" value={dateES(selected.purchaseDate)} />
            <Detail label="Precio venta" value={money(selected.salePrice)} />
            <Detail label="Precio compra" value={money(selected.purchasePrice)} />
            <Detail label="Gastos" value={money(selected.expensesTotal)} />
            <Detail label="Beneficio" value={money(saleProfit(selected))} />
            <Detail label="Margen" value={percent(saleMargin(selected))} />
            <Detail label="Días en stock" value={String(selected.daysInStock)} />
            <Detail label="Pago" value={selected.paymentMethod} />
            <Detail label="Estado" value={selected.status} />
          </div>
        )}
      </Modal>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  )
}
