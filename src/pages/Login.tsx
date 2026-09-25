import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { APP, DEALERSHIP, DEMO_USER } from '@/config/app'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>(DEMO_USER.email)
  const [password, setPassword] = useState<string>(DEMO_USER.password)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      toast.success(`Bienvenido, ${DEMO_USER.name.split(' ')[0]}`)
      navigate('/')
      return
    }
    toast.error('Credenciales incorrectas (usa la demo)')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6f8] p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at 20% 10%, #e2e8f0 0%, transparent 45%), radial-gradient(ellipse at 80% 90%, #cbd5e1 0%, transparent 40%)',
        }}
      />
      <Toaster richColors position="top-right" />
      <Card className="relative z-10 w-full max-w-md shadow-lg">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              {APP.short}
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
              {APP.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{APP.tagline}</p>
            <p className="mt-3 text-xs font-semibold text-slate-600">{DEALERSHIP.name}</p>
          </div>

          <form className="space-y-4" onSubmit={submit}>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">
            Demo: {DEMO_USER.email} / {DEMO_USER.password}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
