import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInCalendarDays, format, formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Vehicle, VehicleExpense } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function money(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function moneyExact(n: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function percent(n: number) {
  return `${n.toLocaleString('es-ES', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} %`
}

export function km(n: number) {
  return `${new Intl.NumberFormat('es-ES').format(n)} km`
}

export function dateES(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy')
}

export function relativeES(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es })
}

export function expensesTotal(expenses: VehicleExpense[]) {
  return expenses.reduce((s, e) => s + e.amount, 0)
}

export function costTotal(v: Pick<Vehicle, 'purchasePrice' | 'expenses'>) {
  return v.purchasePrice + expensesTotal(v.expenses)
}

export function profit(v: Pick<Vehicle, 'purchasePrice' | 'expenses' | 'listPrice'>, salePrice?: number) {
  const price = salePrice ?? v.listPrice
  return price - costTotal(v)
}

export function marginPct(v: Pick<Vehicle, 'purchasePrice' | 'expenses' | 'listPrice'>, salePrice?: number) {
  const price = salePrice ?? v.listPrice
  if (price <= 0) return 0
  return (profit(v, salePrice) / price) * 100
}

export function daysInStock(purchaseDate: string, endDate = new Date()) {
  return Math.max(0, differenceInCalendarDays(endDate, parseISO(purchaseDate)))
}

export function stockAgeLevel(days: number): 'ok' | 'warn' | 'alert' | 'critical' {
  if (days <= 30) return 'ok'
  if (days <= 60) return 'warn'
  if (days <= 90) return 'alert'
  return 'critical'
}

export function recommendedPrice(listPrice: number, days: number) {
  if (days <= 30) return { price: listPrice, reason: 'El vehículo es reciente. Mantén el precio actual.' }
  if (days <= 60)
    return {
      price: Math.round(listPrice * 0.985),
      reason: 'Lleva más de un mes. Una bajada ligera puede acelerar la venta.',
    }
  if (days <= 90)
    return {
      price: Math.round(listPrice * 0.97),
      reason: `Este vehículo lleva ${days} días en stock. Reducir ligeramente el precio podría mejorar su rotación.`,
    }
  return {
    price: Math.round(listPrice * 0.95),
    reason: `Lleva ${days} días en stock. Conviene revisar precio de forma más agresiva.`,
  }
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function vehicleLabel(v: Pick<Vehicle, 'brand' | 'model' | 'version'>) {
  return `${v.brand} ${v.model}${v.version ? ` ${v.version}` : ''}`.trim()
}
