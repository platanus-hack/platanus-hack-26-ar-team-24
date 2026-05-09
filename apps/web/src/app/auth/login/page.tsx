'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { login } from '@/lib/auth'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Email y contraseña son requeridos')
      return
    }

    setLoading(true)
    try {
      const user = await login(formData.email, formData.password)
      if (user.user_type === 'talent') {
        router.push('/dashboard/talent')
      } else {
        router.push('/dashboard/founder')
      }
    } catch (err: any) {
      setError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <MacWindow title="login.agentlink" subtitle="autenticación">
        <div className="p-8 sm:p-10">
          <div className="mb-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              / log in
            </div>
            <h1 className="mt-3 font-serif text-4xl leading-[1] tracking-tight">
              Hola <em className="italic text-muted-foreground">otra vez</em>.
            </h1>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vos@startup.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" disabled={loading} size="lg" variant="default" className="w-full">
              {loading ? 'Ingresando…' : 'Ingresar'}
              {!loading && <ArrowUpRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Registrate
            </Link>
          </p>
        </div>
      </MacWindow>
    </div>
  )
}
