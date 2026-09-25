import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import Analytics from '@/pages/Analytics'
import Crm from '@/pages/Crm'
import Dashboard from '@/pages/Dashboard'
import Documents from '@/pages/Documents'
import Expenses from '@/pages/Expenses'
import Inventory from '@/pages/Inventory'
import Login from '@/pages/Login'
import Profitability from '@/pages/Profitability'
import Publications from '@/pages/Publications'
import Purchases from '@/pages/Purchases'
import Reservations from '@/pages/Reservations'
import Sales from '@/pages/Sales'
import Settings from '@/pages/Settings'
import Tasks from '@/pages/Tasks'
import VehicleDetail from '@/pages/VehicleDetail'
import WebChannel from '@/pages/WebChannel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/vehiculos/:id" element={<VehicleDetail />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/ventas/:id" element={<Sales />} />
          <Route path="/compras" element={<Purchases />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/tareas" element={<Tasks />} />
          <Route path="/crm" element={<Crm />} />
          <Route path="/reservas" element={<Reservations />} />
          <Route path="/web" element={<WebChannel />} />
          <Route path="/publicaciones" element={<Publications />} />
          <Route path="/analitica" element={<Analytics />} />
          <Route path="/rentabilidad" element={<Profitability />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/configuracion" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
