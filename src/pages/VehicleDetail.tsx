import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Globe,
  Pencil,
  Plus,
  ShoppingCart,
} from 'lucide-react'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  PageHeader,
  ProfitabilityInline,
  StockAgeBadge,
  VehicleImage,
} from '@/components/shared/primitives'
import {
  addExpense,
  getVehicle,
  registerSale,
  syncWeb,
  toggleWebPublication,
  updateVehicle,
  useAppState,
} from '@/store/store'
import {
  costTotal,
  dateES,
  daysInStock,
  expensesTotal,
  km,
  marginPct,
  money,
  percent,
  profit,
  recommendedPrice,
  relativeES,
  vehicleLabel,
} from '@/lib/utils'
import type { ExpenseCategory, PaymentMethod } from '@/types'

const TABS = ['Resumen', 'Gastos', 'Documentación', 'Publicación', 'Historial'] as const

export default function VehicleDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  useAppState()
  const vehicle = getVehicle(id)
  const { activity, tasks } = useAppState()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Resumen')
  const [simPrice, setSimPrice] = useState<number | null>(null)
  const [editingPrice, setEditingPrice] = useState(false)
  const [priceDraft, setPriceDraft] = useState(0)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [saleOpen, setSaleOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    concept: '',
    category: 'Taller' as ExpenseCategory,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    supplier: '',
    notes: '',
  })
  const [saleForm, setSaleForm] = useState({
    salePrice: 0,
    saleDate: new Date().toISOString().slice(0, 10),
    buyerName: '',
    sellerName: 'Carlos Rodríguez',
    paymentMethod: 'Contado' as PaymentMethod,
  })

  const days = vehicle ? daysInStock(vehicle.purchaseDate) : 0
  const price = simPrice ?? vehicle?.listPrice ?? 0
  const cost = vehicle ? costTotal(vehicle) : 0
  const profitValue = vehicle ? profit(vehicle, price) : 0
  const margin = vehicle ? marginPct(vehicle, price) : 0
  const rec = vehicle ? recommendedPrice(vehicle.listPrice, days) : null

  const history = useMemo(() => {
    if (!vehicle) return []
    return activity.filter((a) => a.vehicleId === vehicle.id)
  }, [activity, vehicle])

  const vehicleTasks = useMemo(() => {
    if (!vehicle) return []
    return tasks.filter((t) => t.vehicleId === vehicle.id)
  }, [tasks, vehicle])

  if (!vehicle) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="font-semibold">Vehículo no encontrado</p>
        <Link to="/inventario" className="mt-3 inline-block text-sm text-slate-600 underline">
          Volver al inventario
        </Link>
      </div>
    )
  }

  function savePrice() {
    updateVehicle(vehicle!.id, { listPrice: priceDraft })
    setSimPrice(null)
    setEditingPrice(false)
    toast.success('PVP actualizado')
  }

  function submitExpense(e: React.FormEvent) {
    e.preventDefault()
    addExpense(vehicle!.id, expenseForm)
    toast.success('Gasto añadido')
    setExpenseOpen(false)
    setExpenseForm({
      concept: '',
      category: 'Taller',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      supplier: '',
      notes: '',
    })
  }

  function submitSale(e: React.FormEvent) {
    e.preventDefault()
    const sale = registerSale({ vehicleId: vehicle!.id, ...saleForm })
    if (!sale) return
    toast.success(`Venta ${sale.code} registrada`)
    setSaleOpen(false)
    navigate('/ventas')
  }

  function handlePublish(published: boolean) {
    setSyncing(true)
    setTimeout(() => {
      toggleWebPublication(vehicle!.id, published)
      syncWeb(vehicle!.id)
      setSyncing(false)
      toast.success(published ? 'Publicado en la web' : 'Retirado de la web')
    }, 700)
  }

  function handleSync() {
    setSyncing(true)
    setTimeout(() => {
      syncWeb(vehicle!.id)
      setSyncing(false)
      toast.success('Sincronización completada')
    }, 700)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/inventario')}>
          <ArrowLeft className="h-4 w-4" />
          Inventario
        </Button>
        <StatusBadge status={vehicle.status} />
        <StockAgeBadge days={days} />
        {vehicle.publication.web && <Badge tone="success">Web</Badge>}
      </div>

      <PageHeader
        title={vehicleLabel(vehicle)}
        description={`${vehicle.plate} · ${vehicle.year} · ${km(vehicle.km)} · ${vehicle.fuel} · ${vehicle.gearbox}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setExpenseOpen(true)}>
              <Plus className="h-4 w-4" />
              Gasto
            </Button>
            {vehicle.status !== 'vendido' && (
              <Button
                onClick={() => {
                  setSaleForm((f) => ({ ...f, salePrice: vehicle.listPrice }))
                  setSaleOpen(true)
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Registrar venta
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-px">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-3 py-2 text-sm font-semibold ${
              tab === t
                ? 'bg-white text-slate-900 shadow-[0_-1px_0_#fff,inset_0_-2px_0_#0f172a]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Resumen' && (
        <div className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[220px_1fr]">
                <VehicleImage brand={vehicle.brand} model={vehicle.model} className="h-40 w-full" />
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <Info label="VIN" value={vehicle.vin} />
                  <Info label="Color" value={vehicle.color} />
                  <Info label="Potencia" value={`${vehicle.power} CV`} />
                  <Info label="Puertas" value={String(vehicle.doors)} />
                  <Info label="Origen" value={vehicle.origin} />
                  <Info label="Proveedor" value={vehicle.supplier} />
                  <Info label="Fecha compra" value={dateES(vehicle.purchaseDate)} />
                  <Info label="Ubicación" value={vehicle.location} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-slate-600">{vehicle.description}</p>
              </CardContent>
            </Card>

            {vehicleTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tareas asociadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {vehicleTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <span>{t.title}</span>
                      <Badge tone={t.status === 'completado' ? 'success' : 'warn'}>{t.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rentabilidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProfitabilityInline
                  cost={cost}
                  price={price}
                  profitValue={profitValue}
                  margin={margin}
                />
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Compra</span>
                    <span>{money(vehicle.purchasePrice)}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-slate-500">
                    <span>Gastos</span>
                    <span>{money(expensesTotal(vehicle.expenses))}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="mb-0">Simulador de precio</Label>
                    <span className="text-sm font-semibold">{money(price)}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(cost * 0.9)}
                    max={Math.round(vehicle.listPrice * 1.2)}
                    step={50}
                    value={price}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    className="w-full accent-slate-900"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Beneficio simulado: {money(profitValue)} · {percent(margin)}
                  </p>
                </div>

                <div className="flex items-end gap-2">
                  {editingPrice ? (
                    <>
                      <div className="flex-1">
                        <Label>Editar PVP</Label>
                        <Input
                          type="number"
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(Number(e.target.value))}
                        />
                      </div>
                      <Button onClick={savePrice}>Guardar</Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setPriceDraft(vehicle.listPrice)
                        setEditingPrice(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar PVP ({money(vehicle.listPrice)})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {rec && (
              <Card className="border-amber-200 bg-amber-50/40">
                <CardHeader>
                  <CardTitle>Precio recomendado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-900">{money(rec.price)}</p>
                  <p className="mt-2 text-sm text-slate-600">{rec.reason}</p>
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      updateVehicle(vehicle.id, { listPrice: rec.price })
                      setSimPrice(null)
                      toast.success('PVP ajustado al recomendado')
                    }}
                  >
                    Aplicar recomendación
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === 'Gastos' && (
        <Card>
          <CardHeader>
            <CardTitle>Gastos del vehículo</CardTitle>
            <Button size="sm" onClick={() => setExpenseOpen(true)}>
              <Plus className="h-4 w-4" />
              Añadir
            </Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="py-2">Concepto</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th className="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {vehicle.expenses.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="py-2.5 font-medium">{e.concept}</td>
                    <td>{e.category}</td>
                    <td>{dateES(e.date)}</td>
                    <td>{e.supplier}</td>
                    <td className="text-right font-semibold">{money(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={4} className="py-3 font-semibold">
                    Total gastos
                  </td>
                  <td className="text-right font-bold">
                    {money(expensesTotal(vehicle.expenses))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === 'Documentación' && (
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {vehicle.documents.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{d.name}</p>
                  {d.expiresAt && (
                    <p className="text-xs text-slate-500">Caduca {dateES(d.expiresAt)}</p>
                  )}
                </div>
                <Badge
                  tone={
                    d.status === 'correcto' ? 'success' : d.status === 'caducado' ? 'critical' : 'warn'
                  }
                >
                  {d.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'Publicación' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Canales de publicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['web', 'Página web'],
                  ['autoscout24', 'AutoScout24'],
                  ['cochesNet', 'Coches.net'],
                  ['wallapop', 'Wallapop'],
                  ['facebook', 'Facebook'],
                ] as const
              ).map(([key, label]) => (
                <Badge key={key} tone={vehicle.publication[key] ? 'success' : 'muted'}>
                  {label}: {vehicle.publication[key] ? 'Sí' : 'No'}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600">
              {vehicle.publication.title}
              <br />
              <span className="text-slate-500">{vehicle.publication.description}</span>
            </p>
            {vehicle.publication.lastSyncAt && (
              <p className="text-xs text-slate-400">
                Última sync: {relativeES(vehicle.publication.lastSyncAt)}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {vehicle.publication.web ? (
                <Button variant="danger" disabled={syncing} onClick={() => handlePublish(false)}>
                  Despublicar web
                </Button>
              ) : (
                <Button disabled={syncing || vehicle.status === 'vendido'} onClick={() => handlePublish(true)}>
                  Publicar en web
                </Button>
              )}
              <Button variant="secondary" disabled={syncing} onClick={handleSync}>
                {syncing ? 'Sincronizando…' : 'Sincronizar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'Historial' && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-slate-500">Sin actividad registrada para este vehículo.</p>
            )}
            {history.map((a) => (
              <div key={a.id} className="border-b border-slate-50 pb-2 text-sm">
                <p className="text-slate-800">{a.text}</p>
                <p className="text-xs text-slate-400">{relativeES(a.at)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Añadir gasto">
        <form className="grid gap-3" onSubmit={submitExpense}>
          <div>
            <Label>Concepto</Label>
            <Input
              required
              value={expenseForm.concept}
              onChange={(e) => setExpenseForm({ ...expenseForm, concept: e.target.value })}
            />
          </div>
          <div>
            <Label>Categoría</Label>
            <Select
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })
              }
            >
              {[
                'Taller',
                'Neumáticos',
                'Transferencias',
                'ITV',
                'Detailing',
                'Transporte',
                'Publicidad',
                'Garantías',
                'Otros',
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Importe</Label>
              <Input
                type="number"
                required
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Proveedor</Label>
            <Input
              value={expenseForm.supplier}
              onChange={(e) => setExpenseForm({ ...expenseForm, supplier: e.target.value })}
            />
          </div>
          <div>
            <Label>Notas</Label>
            <Textarea
              rows={2}
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setExpenseOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar gasto</Button>
          </div>
        </form>
      </Modal>

      <Modal open={saleOpen} onClose={() => setSaleOpen(false)} title="Registrar venta">
        <form className="grid gap-3" onSubmit={submitSale}>
          <div>
            <Label>Precio de venta</Label>
            <Input
              type="number"
              required
              value={saleForm.salePrice}
              onChange={(e) => setSaleForm({ ...saleForm, salePrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={saleForm.saleDate}
              onChange={(e) => setSaleForm({ ...saleForm, saleDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Comprador</Label>
            <Input
              required
              value={saleForm.buyerName}
              onChange={(e) => setSaleForm({ ...saleForm, buyerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Comercial</Label>
            <Input
              value={saleForm.sellerName}
              onChange={(e) => setSaleForm({ ...saleForm, sellerName: e.target.value })}
            />
          </div>
          <div>
            <Label>Forma de pago</Label>
            <Select
              value={saleForm.paymentMethod}
              onChange={(e) =>
                setSaleForm({ ...saleForm, paymentMethod: e.target.value as PaymentMethod })
              }
            >
              <option>Contado</option>
              <option>Financiación</option>
              <option>Transferencia</option>
            </Select>
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Margen estimado:{' '}
            <strong>
              {money(saleForm.salePrice - cost)} (
              {percent(
                saleForm.salePrice > 0
                  ? ((saleForm.salePrice - cost) / saleForm.salePrice) * 100
                  : 0,
              )}
              )
            </strong>
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSaleOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Confirmar venta</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  )
}
