import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/primitives'
import { updateLeadStatus, useAppState } from '@/store/store'
import { relativeES } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types'

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'contactado', label: 'Contactado' },
  { id: 'visita', label: 'Visita' },
  { id: 'prueba', label: 'Prueba' },
  { id: 'negociacion', label: 'Negociación' },
  { id: 'reserva', label: 'Reserva' },
  { id: 'cerrado', label: 'Cerrado' },
]

export default function Crm() {
  const { leads } = useAppState()
  const [dragId, setDragId] = useState<string | null>(null)

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, [] as Lead[]])) as Record<
      LeadStatus,
      Lead[]
    >
    leads.forEach((l) => map[l.status].push(l))
    return map
  }, [leads])

  function move(id: string, status: LeadStatus) {
    updateLeadStatus(id, status)
    toast.success(`Lead movido a ${COLUMNS.find((c) => c.id === status)?.label}`)
  }

  return (
    <div>
      <PageHeader
        title="CRM / Leads"
        description="Pipeline comercial · arrastra o cambia el estado"
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className="w-64 shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, col.id)
              setDragId(null)
            }}
          >
            <Card className="h-full bg-slate-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                  <span>{col.label}</span>
                  <Badge tone="muted">{byStatus[col.id].length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {byStatus[col.id].map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                  >
                    <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{lead.vehicleLabel}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {lead.source} · {lead.seller}
                    </p>
                    <p className="text-[11px] text-slate-400">{relativeES(lead.lastContactAt)}</p>
                    <Select
                      className="mt-2 h-8 text-xs"
                      value={lead.status}
                      onChange={(e) => move(lead.id, e.target.value as LeadStatus)}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
                {byStatus[col.id].length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 px-2 py-6 text-center text-xs text-slate-400">
                    Vacío
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
