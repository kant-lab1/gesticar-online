import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import {
  EmptyState,
  PageHeader,
  StockAgeBadge,
  VehicleImage,
} from '@/components/shared/primitives'
import { addVehicle, toggleWebPublication, useAppState } from '@/store/store'
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
  vehicleLabel,
} from '@/lib/utils'
import type { Fuel, Gearbox, PurchaseOrigin, VehicleStatus } from '@/types'

const STATUS_TABS: Array<{ id: 'todos' | VehicleStatus; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'disponible', label: 'Disponible' },
  { id: 'en_preparacion', label: 'Preparación' },
  { id: 'reservado', label: 'Reservado' },
  { id: 'taller', label: 'Taller' },
  { id: 'pendiente_documentacion', label: 'Documentación' },
  { id: 'vendido', label: 'Vendido' },
]

const emptyForm = {
  brand: '',
  model: '',
  version: '',
  year: new Date().getFullYear(),
  plate: '',
  vin: '',
  km: 0,
  fuel: 'Gasolina' as Fuel,
  gearbox: 'Manual' as Gearbox,
  power: 100,
  doors: 5,
  color: '',
  purchasePrice: 0,
  listPrice: 0,
  purchaseDate: new Date().toISOString().slice(0, 10),
  supplier: '',
  origin: 'Particular' as PurchaseOrigin,
  location: 'Exposición Santa Cruz',
  status: 'disponible' as VehicleStatus,
  description: '',
  notes: '',
}

export default function Inventory() {
  const { vehicles } = useAppState()
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]['id']>('todos')
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('todas')
  const [sortDaysDesc, setSortDaysDesc] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const brands = useMemo(
    () => [...new Set(vehicles.map((v) => v.brand))].sort(),
    [vehicles],
  )

  const rows = useMemo(() => {
    let list = [...vehicles]
    if (status !== 'todos') list = list.filter((v) => v.status === status)
    if (brand !== 'todas') list = list.filter((v) => v.brand === brand)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((v) =>
        `${v.brand} ${v.model} ${v.version} ${v.plate} ${v.vin}`.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const da = daysInStock(a.purchaseDate)
      const db = daysInStock(b.purchaseDate)
      return sortDaysDesc ? db - da : da - db
    })
    return list
  }, [vehicles, status, brand, search, sortDaysDesc])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brand || !form.model || !form.plate) {
      toast.error('Completa marca, modelo y matrícula')
      return
    }
    const v = addVehicle(form)
    toast.success(`${vehicleLabel(v)} añadido al inventario`)
    setForm(emptyForm)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Gestión de stock activo y vehículos vendidos"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Añadir vehículo
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatus(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              status === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-70">
              {tab.id === 'todos'
                ? vehicles.length
                : vehicles.filter((v) => v.status === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Buscar matrícula, marca, modelo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select className="w-44" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="todas">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
        <Button
          variant={sortDaysDesc ? 'default' : 'secondary'}
          size="sm"
          onClick={() => setSortDaysDesc((v) => !v)}
        >
          {sortDaysDesc ? 'Días ↓' : 'Días ↑'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin vehículos"
          description="No hay resultados con los filtros actuales."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Añadir vehículo
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Foto</th>
                  <th className="px-3 py-3 font-semibold">Vehículo</th>
                  <th className="px-3 py-3 font-semibold">Matrícula</th>
                  <th className="px-3 py-3 font-semibold">Año</th>
                  <th className="px-3 py-3 font-semibold">Km</th>
                  <th className="px-3 py-3 font-semibold">Compra</th>
                  <th className="px-3 py-3 font-semibold">Días</th>
                  <th className="px-3 py-3 font-semibold">Compra €</th>
                  <th className="px-3 py-3 font-semibold">Gastos</th>
                  <th className="px-3 py-3 font-semibold">Coste</th>
                  <th className="px-3 py-3 font-semibold">PVP</th>
                  <th className="px-3 py-3 font-semibold">Margen</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Web</th>
                  <th className="px-3 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => {
                  const exp = expensesTotal(v.expenses)
                  const cost = costTotal(v)
                  const p = profit(v)
                  const m = marginPct(v)
                  return (
                    <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/70">
                      <td className="px-3 py-2">
                        <VehicleImage brand={v.brand} model={v.model} className="h-14 w-[72px] shrink-0" />
                      </td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-900">{vehicleLabel(v)}</p>
                        <p className="text-xs text-slate-500">
                          {v.fuel} · {v.gearbox}
                        </p>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{v.plate}</td>
                      <td className="px-3 py-2">{v.year}</td>
                      <td className="px-3 py-2">{km(v.km)}</td>
                      <td className="px-3 py-2">{dateES(v.purchaseDate)}</td>
                      <td className="px-3 py-2">
                        <StockAgeBadge days={daysInStock(v.purchaseDate)} />
                      </td>
                      <td className="px-3 py-2">{money(v.purchasePrice)}</td>
                      <td className="px-3 py-2">{money(exp)}</td>
                      <td className="px-3 py-2 font-medium">{money(cost)}</td>
                      <td className="px-3 py-2 font-medium">{money(v.listPrice)}</td>
                      <td className="px-3 py-2">
                        <span className={p >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {money(p)}
                          <span className="ml-1 text-xs text-slate-500">{percent(m)}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={v.publication.web ? 'success' : 'secondary'}
                          className={
                            v.publication.web
                              ? 'min-w-[7.5rem]'
                              : 'min-w-[7.5rem] border-slate-300 bg-white text-slate-800 shadow-sm'
                          }
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleWebPublication(v.id, !v.publication.web)
                            toast.success(
                              v.publication.web
                                ? 'Retirado de la web'
                                : 'Publicado en la web',
                            )
                          }}
                        >
                          {v.publication.web ? 'En web ✓' : 'Publicar web'}
                        </Button>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          to={`/vehiculos/${v.id}`}
                          className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline"
                        >
                          Ver ficha
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Añadir vehículo" wide>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submit}>
          <div>
            <Label>Marca</Label>
            <Input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Modelo</Label>
            <Input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Versión</Label>
            <Input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
            />
          </div>
          <div>
            <Label>Matrícula</Label>
            <Input
              value={form.plate}
              onChange={(e) => setForm({ ...form, plate: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Año</Label>
            <Input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Kilómetros</Label>
            <Input
              type="number"
              value={form.km}
              onChange={(e) => setForm({ ...form, km: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Combustible</Label>
            <Select
              value={form.fuel}
              onChange={(e) => setForm({ ...form, fuel: e.target.value as Fuel })}
            >
              {['Gasolina', 'Diésel', 'Híbrido', 'Híbrido enchufable', 'Eléctrico'].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Cambio</Label>
            <Select
              value={form.gearbox}
              onChange={(e) => setForm({ ...form, gearbox: e.target.value as Gearbox })}
            >
              <option>Manual</option>
              <option>Automático</option>
            </Select>
          </div>
          <div>
            <Label>Precio compra</Label>
            <Input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>PVP</Label>
            <Input
              type="number"
              value={form.listPrice}
              onChange={(e) => setForm({ ...form, listPrice: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Fecha compra</Label>
            <Input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Proveedor</Label>
            <Input
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
            />
          </div>
          <div>
            <Label>Origen</Label>
            <Select
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value as PurchaseOrigin })}
            >
              {['Particular', 'Subasta', 'Trade-in', 'Profesional', 'Importación'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>VIN</Label>
            <Input value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
          </div>
          <div>
            <Label>Color</Label>
            <Input
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div>
            <Label>Potencia (CV)</Label>
            <Input
              type="number"
              value={form.power}
              onChange={(e) => setForm({ ...form, power: Number(e.target.value) })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar vehículo</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
