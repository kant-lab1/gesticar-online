import { useSyncExternalStore } from 'react'
import { STORAGE_KEY } from '@/config/app'
import { seedState } from '@/data/seed'
import { costTotal, daysInStock, uid, vehicleLabel } from '@/lib/utils'
import type {
  AppState,
  ExpenseCategory,
  Lead,
  LeadStatus,
  PaymentMethod,
  Sale,
  TaskItem,
  TaskStatus,
  Vehicle,
  VehicleExpense,
  VehicleStatus,
} from '@/types'

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(seedState)
    return JSON.parse(raw) as AppState
  } catch {
    return structuredClone(seedState)
  }
}

let state = load()
const listeners = new Set<() => void>()

function emit() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

function pushActivity(text: string, vehicleId?: string) {
  state = {
    ...state,
    activity: [
      { id: uid('a'), text, at: new Date().toISOString(), vehicleId },
      ...state.activity,
    ].slice(0, 40),
  }
}

export function useAppState() {
  return useSyncExternalStore(subscribe, () => state, () => seedState)
}

export function resetDemo() {
  state = structuredClone(seedState)
  emit()
}

export function getVehicle(id: string) {
  return state.vehicles.find((v) => v.id === id)
}

export function upsertVehicle(vehicle: Vehicle) {
  const exists = state.vehicles.some((v) => v.id === vehicle.id)
  state = {
    ...state,
    vehicles: exists
      ? state.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v))
      : [vehicle, ...state.vehicles],
  }
  emit()
}

export function addVehicle(input: Omit<Vehicle, 'id' | 'expenses' | 'documents' | 'publication' | 'photos'> & {
  expenses?: VehicleExpense[]
}) {
  const vehicle: Vehicle = {
    id: uid('v'),
    photos: [],
    expenses: input.expenses ?? [],
    documents: [
      { id: uid('doc'), name: 'Permiso de circulación', status: 'pendiente' },
      { id: uid('doc'), name: 'Ficha técnica', status: 'pendiente' },
      { id: uid('doc'), name: 'Contrato de compra', status: 'pendiente' },
      { id: uid('doc'), name: 'Factura', status: 'correcto' },
      { id: uid('doc'), name: 'ITV', status: 'pendiente' },
      { id: uid('doc'), name: 'Informe DGT', status: 'pendiente' },
      { id: uid('doc'), name: 'Garantía', status: 'pendiente' },
    ],
    publication: {
      web: false,
      autoscout24: false,
      cochesNet: false,
      wallapop: false,
      facebook: false,
      showPrice: true,
      showFinance: true,
      showPlate: false,
      autoPublish: false,
      title: `${input.brand} ${input.model} ${input.version}`,
      description: input.description,
    },
    ...input,
  }
  state = { ...state, vehicles: [vehicle, ...state.vehicles] }
  pushActivity(`${vehicleLabel(vehicle)} añadido al inventario`, vehicle.id)
  emit()
  return vehicle
}

export function updateVehicle(id: string, patch: Partial<Vehicle>) {
  state = {
    ...state,
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
  }
  emit()
}

export function setVehicleStatus(id: string, status: VehicleStatus) {
  updateVehicle(id, { status })
}

export function addExpense(
  vehicleId: string,
  data: {
    concept: string
    category: ExpenseCategory
    amount: number
    date: string
    supplier: string
    notes?: string
  },
) {
  const expense: VehicleExpense = { id: uid('e'), vehicleId, ...data }
  state = {
    ...state,
    vehicles: state.vehicles.map((v) =>
      v.id === vehicleId ? { ...v, expenses: [expense, ...v.expenses] } : v,
    ),
  }
  const v = getVehicle(vehicleId)
  pushActivity(
    `Nuevo gasto en ${v ? vehicleLabel(v) : 'vehículo'}: ${data.concept} ${data.amount} €`,
    vehicleId,
  )
  emit()
}

export function toggleWebPublication(id: string, published: boolean) {
  const v = getVehicle(id)
  if (!v) return
  updateVehicle(id, {
    publication: {
      ...v.publication,
      web: published,
      lastSyncAt: new Date().toISOString(),
    },
  })
  pushActivity(
    published
      ? `${vehicleLabel(v)} publicado en la página web`
      : `${vehicleLabel(v)} retirado de la web`,
    id,
  )
}

export function syncWeb(id: string) {
  const v = getVehicle(id)
  if (!v) return
  updateVehicle(id, {
    publication: { ...v.publication, lastSyncAt: new Date().toISOString() },
  })
}

export function registerSale(input: {
  vehicleId: string
  salePrice: number
  saleDate: string
  buyerName: string
  sellerName: string
  paymentMethod: PaymentMethod
}) {
  const v = getVehicle(input.vehicleId)
  if (!v) return null
  const expensesTotal = v.expenses.reduce((s, e) => s + e.amount, 0)
  const sale: Sale = {
    id: uid('sale'),
    code: `V-2026-${String(state.sales.length + 1).padStart(4, '0')}`,
    vehicleId: v.id,
    brand: v.brand,
    model: v.model,
    version: v.version,
    plate: v.plate,
    buyerName: input.buyerName,
    sellerName: input.sellerName,
    saleDate: input.saleDate,
    purchaseDate: v.purchaseDate,
    purchasePrice: v.purchasePrice,
    expensesTotal,
    salePrice: input.salePrice,
    daysInStock: daysInStock(v.purchaseDate, new Date(input.saleDate)),
    paymentMethod: input.paymentMethod,
    status: 'Completada',
  }
  state = {
    ...state,
    sales: [sale, ...state.sales],
    vehicles: state.vehicles.map((x) =>
      x.id === v.id ? { ...x, status: 'vendido' as const, listPrice: input.salePrice } : x,
    ),
    reservations: state.reservations.map((r) =>
      r.vehicleId === v.id ? { ...r, status: 'Convertida' as const } : r,
    ),
  }
  pushActivity(`${vehicleLabel(v)} vendido por ${input.salePrice.toLocaleString('es-ES')} €`, v.id)
  emit()
  return sale
}

export function updateLeadStatus(id: string, status: LeadStatus) {
  state = {
    ...state,
    leads: state.leads.map((l) => (l.id === id ? { ...l, status } : l)),
  }
  emit()
}

export function addLead(lead: Omit<Lead, 'id' | 'lastContactAt'> & { lastContactAt?: string }) {
  const item: Lead = {
    id: uid('l'),
    lastContactAt: lead.lastContactAt ?? new Date().toISOString(),
    ...lead,
  }
  state = { ...state, leads: [item, ...state.leads] }
  emit()
  return item
}

export function setTaskStatus(id: string, status: TaskStatus) {
  state = {
    ...state,
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, status } : t)),
  }
  emit()
}

export function addTask(task: Omit<TaskItem, 'id'>) {
  const item = { ...task, id: uid('t') }
  state = { ...state, tasks: [item, ...state.tasks] }
  emit()
}

export function reserveVehicle(input: {
  vehicleId: string
  clientName: string
  deposit: number
  expiresAt: string
  seller: string
}) {
  const v = getVehicle(input.vehicleId)
  if (!v) return
  state = {
    ...state,
    vehicles: state.vehicles.map((x) =>
      x.id === v.id ? { ...x, status: 'reservado' as const } : x,
    ),
    reservations: [
      {
        id: uid('r'),
        vehicleId: v.id,
        vehicleLabel: vehicleLabel(v),
        clientName: input.clientName,
        date: new Date().toISOString().slice(0, 10),
        deposit: input.deposit,
        expiresAt: input.expiresAt,
        seller: input.seller,
        status: 'Activa',
      },
      ...state.reservations,
    ],
  }
  pushActivity(`Reserva recibida para ${vehicleLabel(v)}`, v.id)
  emit()
}

export function activeStock(vehicles = state.vehicles) {
  return vehicles.filter((v) => v.status !== 'vendido')
}

export function vehicleCost(v: Vehicle) {
  return costTotal(v)
}
