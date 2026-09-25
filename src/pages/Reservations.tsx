import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Select } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { EmptyState, MetricCard, PageHeader } from '@/components/shared/primitives'
import { activeStock, reserveVehicle, useAppState } from '@/store/store'
import { dateES, money, vehicleLabel } from '@/lib/utils'

export default function Reservations() {
  const { reservations, vehicles } = useAppState()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    vehicleId: '',
    clientName: '',
    deposit: 500,
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    seller: 'Miguel Soto',
  })

  const available = activeStock(vehicles).filter((v) => v.status === 'disponible')
  const active = reservations.filter((r) => r.status === 'Activa')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.vehicleId || !form.clientName) {
      toast.error('Selecciona vehículo y cliente')
      return
    }
    reserveVehicle(form)
    toast.success('Reserva creada')
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Señales y vehículos bloqueados temporalmente"
        actions={<Button onClick={() => setOpen(true)}>Nueva reserva</Button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Activas" value={String(active.length)} />
        <MetricCard label="Total" value={String(reservations.length)} />
        <MetricCard
          label="Señales"
          value={money(active.reduce((a, r) => a + r.deposit, 0))}
        />
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="Sin reservas" description="No hay reservas registradas." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Vehículo</th>
                  <th className="px-3 py-3 font-semibold">Cliente</th>
                  <th className="px-3 py-3 font-semibold">Fecha</th>
                  <th className="px-3 py-3 font-semibold">Caduca</th>
                  <th className="px-3 py-3 font-semibold">Señal</th>
                  <th className="px-3 py-3 font-semibold">Comercial</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="px-3 py-2.5">
                      <Link to={`/vehiculos/${r.vehicleId}`} className="font-semibold hover:underline">
                        {r.vehicleLabel}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">{r.clientName}</td>
                    <td className="px-3 py-2.5">{dateES(r.date)}</td>
                    <td className="px-3 py-2.5">{dateES(r.expiresAt)}</td>
                    <td className="px-3 py-2.5 font-semibold">{money(r.deposit)}</td>
                    <td className="px-3 py-2.5">{r.seller}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        tone={
                          r.status === 'Activa'
                            ? 'info'
                            : r.status === 'Convertida'
                              ? 'success'
                              : 'warn'
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva reserva">
        <form className="grid gap-3" onSubmit={submit}>
          <div>
            <Label>Vehículo disponible</Label>
            <Select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              required
            >
              <option value="">Seleccionar…</option>
              {available.map((v) => (
                <option key={v.id} value={v.id}>
                  {vehicleLabel(v)} · {v.plate}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Cliente</Label>
            <Input
              required
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Señal (€)</Label>
              <Input
                type="number"
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Caduca</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Comercial</Label>
            <Input
              value={form.seller}
              onChange={(e) => setForm({ ...form, seller: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear reserva</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
