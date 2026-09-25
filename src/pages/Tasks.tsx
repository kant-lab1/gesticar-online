import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState, MetricCard, PageHeader } from '@/components/shared/primitives'
import { setTaskStatus, useAppState } from '@/store/store'
import { dateES } from '@/lib/utils'

export default function Tasks() {
  const { tasks } = useAppState()
  const pending = tasks.filter((t) => t.status !== 'completado')
  const done = tasks.filter((t) => t.status === 'completado')

  function complete(id: string) {
    setTaskStatus(id, 'completado')
    toast.success('Tarea completada')
  }

  function start(id: string) {
    setTaskStatus(id, 'en_curso')
    toast.message('Tarea en curso')
  }

  return (
    <div>
      <PageHeader title="Tareas" description="Pendientes operativos del concesionario" />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Pendientes" value={String(pending.filter((t) => t.status === 'pendiente').length)} />
        <MetricCard label="En curso" value={String(pending.filter((t) => t.status === 'en_curso').length)} />
        <MetricCard label="Completadas" value={String(done.length)} />
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="Sin tareas" description="No hay tareas en el sistema." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3 font-semibold">Tarea</th>
                  <th className="px-3 py-3 font-semibold">Vehículo</th>
                  <th className="px-3 py-3 font-semibold">Vence</th>
                  <th className="px-3 py-3 font-semibold">Asignado</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50">
                    <td className="px-3 py-2.5 font-medium">{t.title}</td>
                    <td className="px-3 py-2.5">
                      {t.vehicleId ? (
                        <Link to={`/vehiculos/${t.vehicleId}`} className="hover:underline">
                          {t.vehicleLabel}
                        </Link>
                      ) : (
                        t.vehicleLabel
                      )}
                    </td>
                    <td className="px-3 py-2.5">{dateES(t.dueDate)}</td>
                    <td className="px-3 py-2.5">{t.assignee}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        tone={
                          t.status === 'completado'
                            ? 'success'
                            : t.status === 'en_curso'
                              ? 'info'
                              : 'warn'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-2">
                        {t.status === 'pendiente' && (
                          <Button size="sm" variant="secondary" onClick={() => start(t.id)}>
                            Iniciar
                          </Button>
                        )}
                        {t.status !== 'completado' && (
                          <Button size="sm" onClick={() => complete(t.id)}>
                            <Check className="h-3.5 w-3.5" />
                            Completar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
