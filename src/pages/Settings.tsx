import { toast } from 'sonner'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { PageHeader } from '@/components/shared/primitives'
import { APP, DEALERSHIP, DEMO_USER } from '@/config/app'
import { resetDemo } from '@/store/store'

export default function Settings() {
  function handleReset() {
    if (!confirm('¿Restablecer datos demo? Se perderán los cambios locales.')) return
    resetDemo()
    toast.success('Datos demo restablecidos')
  }

  return (
    <div>
      <PageHeader
        title="Configuración"
        description={`${APP.name} ${APP.version}`}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos de la empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nombre comercial</Label>
              <Input readOnly value={DEALERSHIP.name} />
            </div>
            <div>
              <Label>CIF</Label>
              <Input readOnly value={DEALERSHIP.cif} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input readOnly value={DEALERSHIP.phone} />
            </div>
            <div>
              <Label>Email</Label>
              <Input readOnly value={DEALERSHIP.email} />
            </div>
            <div>
              <Label>Web</Label>
              <Input readOnly value={DEALERSHIP.web} />
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección</Label>
              <Input readOnly value={DEALERSHIP.address} />
            </div>
            <div className="sm:col-span-2">
              <Label>Ubicación</Label>
              <Input readOnly value={DEALERSHIP.location} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuario demo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div>
              <Label>Nombre</Label>
              <Input readOnly value={DEMO_USER.name} />
            </div>
            <div>
              <Label>Email</Label>
              <Input readOnly value={DEMO_USER.email} />
            </div>
            <div>
              <Label>Rol</Label>
              <Input readOnly value={DEMO_USER.role} />
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border-rose-200">
          <CardHeader>
            <CardTitle>Entorno demo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-sm text-slate-600">
              Restablece el inventario, ventas, leads y actividad a los datos semilla originales
              de GestiCar Canarias.
            </p>
            <Button variant="danger" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Restablecer demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
