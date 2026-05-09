'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AmbientBg } from '@/components/ambient-bg'
import { Wordmark } from '@/components/wordmark'
import { MacWindow } from '@/components/mac-window'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function StartupOnboarding() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stack: [] as string[],
    culture_values: [] as string[],
  })

  const [stackInput, setStackInput] = useState('')
  const [cultureInput, setCultureInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addStack = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (stackInput.trim()) {
        setFormData((prev) => ({ ...prev, stack: [...prev.stack, stackInput.trim()] }))
        setStackInput('')
      }
    }
  }

  const removeStack = (index: number) => {
    setFormData((prev) => ({ ...prev, stack: prev.stack.filter((_, i) => i !== index) }))
  }

  const addCulture = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (cultureInput.trim()) {
        setFormData((prev) => ({
          ...prev,
          culture_values: [...prev.culture_values, cultureInput.trim()],
        }))
        setCultureInput('')
      }
    }
  }

  const removeCulture = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      culture_values: prev.culture_values.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) return setError('El nombre de la startup es requerido')
    if (!formData.description.trim()) return setError('La descripción es requerida')
    if (formData.description.length < 20)
      return setError('La descripción debe tener al menos 20 caracteres')
    if (formData.stack.length === 0) return setError('Agregá al menos una tecnología')

    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const username =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'user'

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingUser) {
        const { error: userError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            username,
            user_type: 'founder',
            password_hash: 'oauth_user',
          },
        ])
        if (userError) throw userError
      }

      const profileData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        stack: formData.stack,
        culture_values: formData.culture_values,
      }

      const { data: existing } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let result
      if (existing) {
        result = await supabase
          .from('startup_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
      } else {
        result = await supabase.from('startup_profiles').insert([profileData]).select()
      }

      if (result.error) throw result.error

      router.push('/dashboard/founder')
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el perfil de la startup')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBg />

      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Wordmark />
          <Badge variant="outline" className="font-mono text-[10px]">
            STEP 02 / 02
          </Badge>
        </div>
      </header>

      <main className="px-4 pb-20 pt-8">
        <div className="mx-auto max-w-2xl animate-fade-in">
          <MacWindow title="profile.startup" subtitle="entrenando agente">
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  / perfil de startup
                </div>
                <h1 className="mt-3 font-serif text-4xl leading-[1] tracking-tight sm:text-5xl">
                  Tu <em className="italic text-accent">visión</em>, en pocas líneas.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Esto es lo que tu agente va a usar para encontrar talento alineado.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la startup</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="ej. Nimbus AI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">¿Qué hace tu startup?</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describí la misión, el problema que resolvés y la visión a 3 años…"
                    rows={5}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formData.description.length} caracteres · min 20
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Stack tecnológico · Enter para agregar</Label>
                  <Input
                    type="text"
                    value={stackInput}
                    onChange={(e) => setStackInput(e.target.value)}
                    onKeyDown={addStack}
                    placeholder="React, Node.js, PostgreSQL…"
                  />
                  {formData.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {formData.stack.map((tech, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeStack(i)}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground transition hover:opacity-90"
                        >
                          {tech}
                          <X className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Valores de cultura · Enter para agregar</Label>
                  <Input
                    type="text"
                    value={cultureInput}
                    onChange={(e) => setCultureInput(e.target.value)}
                    onKeyDown={addCulture}
                    placeholder="Innovación, Transparencia, Velocidad…"
                  />
                  {formData.culture_values.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {formData.culture_values.map((value, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeCulture(i)}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs text-background transition hover:bg-foreground/85"
                        >
                          {value}
                          <X className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  variant="accent"
                  className="w-full glow-accent"
                >
                  {loading ? 'Activando agente…' : 'Activar el agente de mi startup'}
                  {!loading && <ArrowUpRight className="size-4" />}
                </Button>
              </div>
            </form>
          </MacWindow>
        </div>
      </main>
    </div>
  )
}
