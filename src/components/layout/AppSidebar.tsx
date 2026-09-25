import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Car,
  ShoppingCart,
  Package,
  Wallet,
  CheckSquare,
  Users,
  Bookmark,
  Globe,
  Share2,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { APP, DEALERSHIP, DEMO_USER } from '@/config/app'
import { cn } from '@/lib/utils'

const sections = [
  {
    title: 'Inicio',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Operaciones',
    items: [
      { to: '/inventario', label: 'Inventario', icon: Car },
      { to: '/ventas', label: 'Ventas', icon: ShoppingCart },
      { to: '/compras', label: 'Compras', icon: Package },
      { to: '/gastos', label: 'Gastos', icon: Wallet },
      { to: '/tareas', label: 'Tareas', icon: CheckSquare },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { to: '/crm', label: 'CRM / Leads', icon: Users },
      { to: '/reservas', label: 'Reservas', icon: Bookmark },
    ],
  },
  {
    title: 'Canales',
    items: [
      { to: '/web', label: 'Página web', icon: Globe },
      { to: '/publicaciones', label: 'Publicaciones', icon: Share2 },
    ],
  },
  {
    title: 'Análisis',
    items: [
      { to: '/analitica', label: 'Analítica', icon: BarChart3 },
      { to: '/rentabilidad', label: 'Rentabilidad', icon: TrendingUp },
    ],
  },
  {
    title: 'Administración',
    items: [
      { to: '/documentos', label: 'Documentos', icon: FileText },
      { to: '/configuracion', label: 'Configuración', icon: Settings },
    ],
  },
]

export function AppSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-white transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-[260px]',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-slate-100 px-3',
          collapsed ? 'justify-center' : 'justify-between gap-2',
        )}
      >
        {!collapsed && (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
              {APP.short}
            </div>
            <div className="min-w-0">
              <p className="truncate font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-slate-900">
                {APP.name}
              </p>
              <p className="truncate text-[10px] text-slate-500">{APP.tagline}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <p className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? Boolean(item.end) : false}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
                      isActive &&
                        'bg-slate-100 font-semibold text-slate-900 shadow-[inset_3px_0_0_0_#0f172a]',
                      collapsed && 'justify-center px-0',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-80 group-[.active]:opacity-100" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
            {DEMO_USER.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">{DEALERSHIP.name}</p>
              <p className="truncate text-[11px] text-slate-500">
                {DEMO_USER.name} · {DEMO_USER.role}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
