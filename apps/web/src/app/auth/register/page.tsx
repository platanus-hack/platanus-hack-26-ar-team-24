'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Briefcase, Rocket } from 'lucide-react'
import { register } from '@/lib/auth'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type') as 'talent' | 'founder' | null

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    user_type: typeParam || ('talent' as 'talent' | 'founder'),
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const setType = (t: 'talent' | 'founder') =>
    setFormData((prev) => ({ ...prev, user_type: t }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.username || !formData.password) {
      setError('Todos los campos son requeridos')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await register(
        formData.email,
        formData.username,
        formData.password,
        formData.user_type
      )
      router.push(
        formData.user_type === 'talent' ? '/onboarding/candidate' : '/onboarding/startup'
      )
    } catch (err: any) {
      setError(err.message || 'No se pudo crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <MacWindow title="signup.agentlink" subtitle="nueva cuenta">
        <div className="p-8 sm:p-10">
          <div className="mb-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              / sign up
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-[1] tracking-tight">
              Sumate a <em className="italic text-accent">AgentLink</em>.
            </h1>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="mb-2 block">Soy</Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-foreground/[0.04] p-1">
                {[
                  { value: 'talent' as const, label: 'Talento', icon: Briefcase },
                  { value: 'founder' as const, label: 'Founder', icon: Rocket },
                ].map((opt) => {
                  const active = formData.user_type === opt.value
                  const Icon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value)}
                      className={cn(
                        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-card text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_1px_3px_0_rgba(0,0,0,0.08)]'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="size-3.5" />
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="vos@startup.com" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="tu_handle" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar</Label>
                <Input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
              </div>
            </div>

            <Button type="submit" disabled={loading} size="lg" variant="accent" className="w-full glow-accent">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
              {!loading && <ArrowUpRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Ingresá
            </Link>
          </p>
        </div>
      </MacWindow>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Cargando…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
