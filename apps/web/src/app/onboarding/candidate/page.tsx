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

export default function CandidateOnboarding() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    experience_years: 0,
    technologies: [] as string[],
    github_url: '',
    linkedin_url: '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) : value,
    }))
  }

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (skillInput.trim()) {
        setFormData((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
        setSkillInput('')
      }
    }
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }))
  }

  const addTechnology = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (techInput.trim()) {
        setFormData((prev) => ({ ...prev, technologies: [...prev.technologies, techInput.trim()] }))
        setTechInput('')
      }
    }
  }

  const removeTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.bio.trim()) return setError('La bio es requerida')
    if (formData.bio.length < 10) return setError('La bio debe tener al menos 10 caracteres')
    if (formData.skills.length === 0) return setError('Agregá al menos una skill')

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
            user_type: 'talent',
            password_hash: 'oauth_user',
          },
        ])
        if (userError) throw userError
      }

      const profileData = {
        user_id: user.id,
        bio: formData.bio,
        skills: formData.skills,
        experience_years: formData.experience_years,
        technologies: formData.technologies,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
      }

      const { data: existing } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      let result
      if (existing) {
        result = await supabase
          .from('candidate_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
      } else {
        result = await supabase.from('candidate_profiles').insert([profileData]).select()
      }

      if (result.error) throw result.error

      router.push('/dashboard/talent')
    } catch (err: any) {
      setError(err.message || 'No se pudo crear el perfil')
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
          <MacWindow title="profile.candidate" subtitle="entrenando agente">
            <form onSubmit={handleSubmit} className="p-8 sm:p-10">
              <div className="mb-8">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  / perfil de talento
                </div>
                <h1 className="mt-3 font-serif text-4xl leading-[1] tracking-tight sm:text-5xl">
                  Tu <em className="italic text-accent">huella</em> profesional.
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Cuanto más rica sea tu info, mejor matcheás. Tu agente lee esto.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describí tu trayectoria, lo que te apasiona, y qué buscás en una startup…"
                    rows={4}
                  />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {formData.bio.length} caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_years">Años de experiencia</Label>
                  <select
                    id="experience_years"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-xl border border-border bg-card/60 px-4 py-2 text-sm text-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset,0_1px_2px_0_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200 focus:outline-none focus:border-foreground/40 focus:ring-4 focus:ring-foreground/5"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((year) => (
                      <option key={year} value={year}>
                        {year === 0 ? 'Sin experiencia' : `${year}+ años`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Skills · Enter para agregar</Label>
                  <Input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={addSkill}
                    placeholder="React, Product, Diseño, Liderazgo…"
                  />
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {formData.skills.map((skill, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeSkill(i)}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1 text-xs text-background transition hover:bg-foreground/85"
                        >
                          {skill}
                          <X className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Tecnologías · Enter para agregar</Label>
                  <Input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={addTechnology}
                    placeholder="TypeScript, PostgreSQL, AWS, Figma…"
                  />
                  {formData.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {formData.technologies.map((tech, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => removeTechnology(i)}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground transition hover:opacity-90"
                        >
                          {tech}
                          <X className="size-3 opacity-60 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="github_url">GitHub <span className="lowercase opacity-60">(opcional)</span></Label>
                    <Input
                      id="github_url"
                      type="url"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleChange}
                      placeholder="github.com/vos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn <span className="lowercase opacity-60">(opcional)</span></Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/vos"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  variant="accent"
                  className="w-full glow-accent"
                >
                  {loading ? 'Activando agente…' : 'Activar mi agente'}
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
