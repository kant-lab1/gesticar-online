export type VehicleStatus =
  | 'disponible'
  | 'en_preparacion'
  | 'reservado'
  | 'vendido'
  | 'pendiente_documentacion'
  | 'taller'

export type Fuel = 'Gasolina' | 'Diésel' | 'Híbrido' | 'Híbrido enchufable' | 'Eléctrico'
export type Gearbox = 'Manual' | 'Automático'
export type ExpenseCategory =
  | 'Taller'
  | 'Neumáticos'
  | 'Transferencias'
  | 'ITV'
  | 'Detailing'
  | 'Transporte'
  | 'Publicidad'
  | 'Garantías'
  | 'Otros'

export type PurchaseOrigin =
  | 'Particular'
  | 'Subasta'
  | 'Trade-in'
  | 'Profesional'
  | 'Importación'

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'visita'
  | 'prueba'
  | 'negociacion'
  | 'reserva'
  | 'cerrado'

export type TaskStatus = 'pendiente' | 'en_curso' | 'completado'
export type PaymentMethod = 'Contado' | 'Financiación' | 'Transferencia'
export type DocStatus = 'correcto' | 'pendiente' | 'caducado'

export type InvoiceStatus = 'borrador' | 'emitida' | 'enviada_verifactu' | 'anulada'
export type InvoiceType = 'factura' | 'factura_rectificativa' | 'proforma'
export type VerifactuState = 'pendiente' | 'enviado' | 'aceptado' | 'rechazado' | 'no_aplica'

export interface VehicleExpense {
  id: string
  vehicleId: string
  concept: string
  category: ExpenseCategory
  date: string
  supplier: string
  amount: number
  notes?: string
}

export interface VehicleDocument {
  id: string
  name: string
  status: DocStatus
  updatedAt?: string
  expiresAt?: string
  fileName?: string
  fileSize?: number
  /** data URL o blob local (demo) */
  fileDataUrl?: string
}

export interface InvoiceLine {
  id: string
  description: string
  qty: number
  unitPrice: number
  vatRate: number
}

export interface Invoice {
  id: string
  number: string
  series: string
  type: InvoiceType
  status: InvoiceStatus
  issueDate: string
  dueDate?: string
  vehicleId?: string
  vehicleLabel?: string
  clientName: string
  clientNif: string
  clientAddress: string
  lines: InvoiceLine[]
  notes?: string
  verifactu: {
    state: VerifactuState
    hash?: string
    previousHash?: string
    qrPayload?: string
    sentAt?: string
    aeRecordId?: string
    message?: string
  }
  createdAt: string
}

export interface ContractTemplate {
  id: string
  name: string
  body: string
  updatedAt: string
  isDefault?: boolean
}

export interface GeneratedContract {
  id: string
  templateId: string
  templateName: string
  vehicleId: string
  vehicleLabel: string
  clientName: string
  clientNif: string
  body: string
  createdAt: string
}

export interface CompanyProfile {
  name: string
  cif: string
  phone: string
  email: string
  web: string
  address: string
  location: string
  logoDataUrl?: string
  invoiceSeries: string
  verifactuEnabled: boolean
}

export interface PublicationState {
  web: boolean
  autoscout24: boolean
  cochesNet: boolean
  wallapop: boolean
  facebook: boolean
  lastSyncAt?: string
  webSlug?: string
  title?: string
  description?: string
  showPrice: boolean
  showFinance: boolean
  showPlate: boolean
  autoPublish: boolean
}

export interface Vehicle {
  id: string
  brand: string
  model: string
  version: string
  year: number
  plate: string
  vin: string
  km: number
  fuel: Fuel
  gearbox: Gearbox
  power: number
  doors: number
  color: string
  purchasePrice: number
  listPrice: number
  purchaseDate: string
  supplier: string
  origin: PurchaseOrigin
  location: string
  status: VehicleStatus
  photos: string[]
  description: string
  expenses: VehicleExpense[]
  documents: VehicleDocument[]
  publication: PublicationState
  notes?: string
}

export interface Sale {
  id: string
  code: string
  vehicleId: string
  brand: string
  model: string
  version: string
  plate: string
  buyerName: string
  sellerName: string
  saleDate: string
  purchaseDate: string
  purchasePrice: number
  expensesTotal: number
  salePrice: number
  daysInStock: number
  paymentMethod: PaymentMethod
  status: 'Completada' | 'Pendiente'
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  vehicleId?: string
  vehicleLabel: string
  source: string
  status: LeadStatus
  seller: string
  lastContactAt: string
  notes?: string
}

export interface Reservation {
  id: string
  vehicleId: string
  vehicleLabel: string
  clientName: string
  date: string
  deposit: number
  expiresAt: string
  seller: string
  status: 'Activa' | 'Caducada' | 'Convertida'
}

export interface TaskItem {
  id: string
  vehicleId?: string
  vehicleLabel: string
  title: string
  dueDate: string
  status: TaskStatus
  assignee: string
}

export interface ActivityItem {
  id: string
  text: string
  at: string
  vehicleId?: string
}

export interface AppState {
  vehicles: Vehicle[]
  sales: Sale[]
  leads: Lead[]
  reservations: Reservation[]
  tasks: TaskItem[]
  activity: ActivityItem[]
  invoices: Invoice[]
  contractTemplates: ContractTemplate[]
  contracts: GeneratedContract[]
  company: CompanyProfile
}
