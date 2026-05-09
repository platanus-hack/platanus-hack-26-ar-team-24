'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Logo from '@/components/layout/Logo'
import { api } from '@/lib/api'
import { setAgentSession } from '@/lib/agent-session'
import type { AgentRole } from '@/types/api'

type ScaleValue = 1 | 2 | 3 | 4 | 5

type FormState = {
  roleLabel: string
  name: string
  age: string
  location: string
  githubUrl: string
  emotionalTone: string
  deepFrustration: string
  emotionalDrive: string
  hobbyRecharge: string
  freeTimeStyle: string
  workplacePriority: string
  idealMatch: string
  fiveYearVision: string
  emotionalScores: {
    optimism: ScaleValue
    processing: ScaleValue
    stress: ScaleValue
    impulsiveness: ScaleValue
    pragmatism: ScaleValue
  }
  lifestyleScores: {
    order: ScaleValue
    socialization: ScaleValue
    learningPace: ScaleValue
    techSpillover: ScaleValue
  }
}

const EMOTIONAL_QUESTIONS = [
  {
    key: 'optimism',
    label: 'Optimismo vs realismo',
    left: 'Muy realista',
    right: 'Muy optimista',
  },
  {
    key: 'processing',
    label: 'Procesamiento emocional',
    left: 'Necesito tiempo',
    right: 'Reacciono y sigo',
  },
  {
    key: 'stress',
    label: 'Manejo del estrés',
    left: 'Me paraliza',
    right: 'Me activa',
  },
  {
    key: 'impulsiveness',
    label: 'Impulsividad vs reflexión',
    left: 'Muy reflexivo',
    right: 'Muy impulsivo',
  },
  {
    key: 'pragmatism',
    label: 'Empatía vs pragmatismo',
    left: 'Primero empatía',
    right: 'Primero soluciones',
  },
] as const

const LIFESTYLE_QUESTIONS = [
  {
    key: 'order',
    label: 'Orden vs caos',
    left: 'Muy ordenado',
    right: 'Caótico creativo',
  },
  {
    key: 'socialization',
    label: 'Socialización laboral',
    left: 'Muy autónomo',
    right: 'Muy social',
  },
  {
    key: 'learningPace',
    label: 'Ritmo de aprendizaje',
    left: 'Lento y claro',
    right: 'Denso y rápido',
  },
  {
    key: 'techSpillover',
    label: 'Tech fuera del trabajo',
    left: 'Corto al salir',
    right: 'Sigo pensando',
  },
] as const

const INITIAL_STATE: FormState = {
  roleLabel: '',
  name: '',
  age: '',
  location: '',
  githubUrl: '',
  emotionalTone: '',
  deepFrustration: '',
  emotionalDrive: '',
  hobbyRecharge: '',
  freeTimeStyle: '',
  workplacePriority: '',
  idealMatch: '',
  fiveYearVision: '',
  emotionalScores: {
    optimism: 3,
    processing: 3,
    stress: 3,
    impulsiveness: 3,
    pragmatism: 3,
  },
  lifestyleScores: {
    order: 3,
    socialization: 3,
    learningPace: 3,
    techSpillover: 3,
  },
}

export default function UnifiedAgentOnboarding() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('Tu nombre es obligatorio.')
      return
    }

    if (!form.emotionalTone.trim()) {
      setError('Necesitamos una lectura corta de qué emociones te caracterizan.')
      return
    }

    if (!form.roleLabel.trim()) {
      setError('Contanos qué rol querés que tenga tu agente.')
      return
    }

    if (!form.idealMatch.trim() || !form.fiveYearVision.trim()) {
      setError('Completá expectativas y visión a 5 años.')
      return
    }

    const githubUrl = normalizeGithubUrl(form.githubUrl)
    if (form.githubUrl.trim() && !githubUrl) {
      setError('Ingresá una URL válida de GitHub.')
      return
    }

    setLoading(true)

    try {
      const normalizedRole = inferAgentRole(form.roleLabel)
      const response = await api.createAgent({
        name: form.name.trim(),
        age: form.age || undefined,
        location: form.location || undefined,
        githubUrl: githubUrl || undefined,
        bio: buildBio(form),
        personal: {
          emotionalProfile: form.emotionalScores,
          emotionalTone: form.emotionalTone.trim(),
          frustrations: form.deepFrustration.trim(),
          emotionalDrive: form.emotionalDrive.trim(),
          fiveYearVision: form.fiveYearVision.trim(),
        },
        social: {
          lifestyleProfile: form.lifestyleScores,
          hobbyRecharge: form.hobbyRecharge.trim(),
          freeTimeStyle: form.freeTimeStyle.trim(),
          idealMatch: form.idealMatch.trim(),
        },
        professional: {
          role: form.roleLabel.trim(),
          workplacePriority: form.workplacePriority.trim(),
          collaborationStyle: summarizeLifestyle(form),
        },
        extra: {
          selectedRole: form.roleLabel.trim(),
          normalizedRole,
          questionnaireVersion: 'v2-unified-agent',
        },
      })

      setAgentSession({
        activeAgentId: response.agent.id,
        activeAgentName: form.name.trim(),
        role: normalizedRole,
        grading: response.grading,
      })

      router.push(normalizedRole === 'founder' ? '/dashboard/founder' : '/dashboard/talent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu agente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-ink-950 text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 16% 18%, rgba(244,114,182,0.12), transparent 42%), radial-gradient(ellipse at 82% 82%, rgba(6,182,212,0.10), transparent 42%)',
        }}
      />

      <div className="relative min-h-[100dvh] max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between mb-10">
          <Logo href="/landing" />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Volver
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.88fr_1.12fr] gap-10 items-start">
          <section className="max-w-xl xl:sticky xl:top-28">
            <p className="text-xs font-mono text-zinc-500 mb-4 tracking-[0.22em] uppercase">
              Crear agente
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl leading-[0.98] tracking-tight mb-6">
              Un solo flujo.
              <br />
              <span className="italic text-zinc-300">Después definís el rol.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-[34rem]">
              No hace falta preguntarte veinte cosas. Necesitamos suficiente señal para entender
              cómo sentís, cómo trabajás y qué esperás de una conexión real.
            </p>

            <div className="mt-8 space-y-4">
              <InfoBlock
                eyebrow="Sección 1"
                title="Personalidad emocional"
                body="Cómo procesás presión, conflicto, impulso y energía."
              />
              <InfoBlock
                eyebrow="Sección 2"
                title="Ambiente y estilo de vida"
                body="Cómo trabajás, cómo aprendés y qué te recarga."
              />
              <InfoBlock
                eyebrow="Sección 3"
                title="Expectativas y límites"
                body="Qué no negociás y con quién querés construir."
              />
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-[0_24px_80px_-28px_rgba(0,0,0,0.65)] overflow-hidden">
            <div className="px-7 sm:px-9 py-7 sm:py-8 border-b border-white/6">
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">
                Perfil base
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-3">
                Diseñá cómo piensa tu agente.
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[42rem]">
                Primero modelamos a la persona. Después ese mismo agente sale a operar como perfil personal o como agente startup.
              </p>
            </div>

            <div className="px-7 sm:px-9 py-7 sm:py-8">
              {error && (
                <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10">
                <section className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nombre" align="grid">
                      <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Sofía"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Rol del agente" align="grid">
                      <input
                        value={form.roleLabel}
                        onChange={(event) => setForm((current) => ({ ...current, roleLabel: event.target.value }))}
                        placeholder="Ej: founder técnico, product builder, agente de hiring, explorador creativo"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Edad" align="grid">
                      <input
                        value={form.age}
                        onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
                        placeholder="29"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Ubicación" align="grid">
                      <input
                        value={form.location}
                        onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                        placeholder="Buenos Aires"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="URL de GitHub (opcional)">
                    <input
                      type="url"
                      value={form.githubUrl}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, githubUrl: event.target.value }))
                      }
                      placeholder="https://github.com/tu-usuario"
                      className={inputClass}
                    />
                  </Field>

                  <div className="rounded-[1.5rem] border border-white/8 bg-black/15 px-5 py-5">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-500 mb-2">
                      Rol del agente
                    </p>
                    <p className="text-white mb-1">{form.roleLabel.trim() || 'Todavía no lo definiste'}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Escribilo con tus palabras. Nosotros lo usamos como contexto real del perfil, sin limitarte a categorías cerradas.
                    </p>
                  </div>
                </section>

                <QuestionSection
                  eyebrow="Sección 1"
                  title="Personalidad emocional"
                  description="Buscamos entender cómo reaccionás, qué te mueve y qué te desordena."
                >
                  <div className="space-y-5">
                    {EMOTIONAL_QUESTIONS.map((question) => (
                      <LikertRow
                        key={question.key}
                        label={question.label}
                        left={question.left}
                        right={question.right}
                        value={form.emotionalScores[question.key]}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            emotionalScores: {
                              ...current.emotionalScores,
                              [question.key]: value,
                            },
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Qué emociones te caracterizan" align="grid">
                      <textarea
                        value={form.emotionalTone}
                        onChange={(event) => setForm((current) => ({ ...current, emotionalTone: limitText(event.target.value, 80) }))}
                        rows={3}
                        placeholder="Curioso, intenso, paciente, frontal"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                    <Field label="Qué te frustra profundamente" align="grid">
                      <textarea
                        value={form.deepFrustration}
                        onChange={(event) => setForm((current) => ({ ...current, deepFrustration: limitText(event.target.value, 150) }))}
                        rows={3}
                        placeholder="La ambigüedad eterna, la tibieza, la falta de honestidad"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <Field label="Qué te motiva emocionalmente">
                    <textarea
                      value={form.emotionalDrive}
                      onChange={(event) => setForm((current) => ({ ...current, emotionalDrive: limitText(event.target.value, 150) }))}
                      rows={3}
                      placeholder="Resolver cosas difíciles con gente brillante y sentir que estoy creciendo"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </QuestionSection>

                <QuestionSection
                  eyebrow="Sección 2"
                  title="Ambiente laboral, hobbies y estilo de vida"
                  description="Cómo trabajás, cómo aprendés y qué ritmo de vida te hace bien."
                >
                  <div className="space-y-5">
                    {LIFESTYLE_QUESTIONS.map((question) => (
                      <LikertRow
                        key={question.key}
                        label={question.label}
                        left={question.left}
                        right={question.right}
                        value={form.lifestyleScores[question.key]}
                        onChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            lifestyleScores: {
                              ...current.lifestyleScores,
                              [question.key]: value,
                            },
                          }))
                        }
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Cómo recargás energía" align="grid">
                      <textarea
                        value={form.hobbyRecharge}
                        onChange={(event) => setForm((current) => ({ ...current, hobbyRecharge: limitText(event.target.value, 150) }))}
                        rows={3}
                        placeholder="Correr, leer ensayo, cocinar, perderme en música"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                    <Field label="Cómo preferís pasar tu tiempo libre" align="grid">
                      <textarea
                        value={form.freeTimeStyle}
                        onChange={(event) => setForm((current) => ({ ...current, freeTimeStyle: limitText(event.target.value, 150) }))}
                        rows={3}
                        placeholder="Solo, con gente cercana, afuera, adentro"
                        className={`${inputClass} resize-none`}
                      />
                    </Field>
                  </div>

                  <Field label="Qué aspecto del ambiente laboral te importa más">
                    <textarea
                      value={form.workplacePriority}
                      onChange={(event) => setForm((current) => ({ ...current, workplacePriority: limitText(event.target.value, 150) }))}
                      rows={3}
                      placeholder="Equipo, autonomía, misión, herramientas, plata"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </QuestionSection>

                <QuestionSection
                  eyebrow="Sección 3"
                  title="Expectativas"
                  description="Acá aparece el criterio real: qué tipo de conexión querés construir."
                >
                  <Field label="Qué esperás del match ideal">
                    <textarea
                      value={form.idealMatch}
                      onChange={(event) => setForm((current) => ({ ...current, idealMatch: limitText(event.target.value, 200) }))}
                      rows={3}
                      placeholder="Claridad, ambición sana, criterio propio y capacidad de debatir sin romper"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>

                  <Field label="Tu visión a 5 años">
                    <textarea
                      value={form.fiveYearVision}
                      onChange={(event) => setForm((current) => ({ ...current, fiveYearVision: limitText(event.target.value, 250) }))}
                      rows={4}
                      placeholder="Qué querés estar construyendo, con quién y en qué contexto de vida"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </QuestionSection>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-black px-5 py-4 text-base font-medium hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {loading ? 'Creando agente...' : 'Crear agente'}
                  {!loading && <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  align = 'default',
}: {
  label: string
  children: React.ReactNode
  align?: 'default' | 'grid'
}) {
  return (
    <div className="space-y-2">
      <label
        className={`block text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 ${
          align === 'grid' ? 'min-h-[2.75rem] flex items-end' : ''
        }`}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

function QuestionSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6 border-t border-white/6 pt-8 first:border-t-0 first:pt-0">
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-3">{eyebrow}</p>
        <h3 className="font-serif text-2xl sm:text-3xl leading-tight mb-3">{title}</h3>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-[38rem]">{description}</p>
      </div>
      {children}
    </section>
  )
}

function InfoBlock({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.025] px-5 py-5">
      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">{eyebrow}</p>
      <h3 className="font-serif text-2xl text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  )
}

function LikertRow({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string
  left: string
  right: string
  value: ScaleValue
  onChange: (value: ScaleValue) => void
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.025] px-4 py-4">
      <p className="text-sm text-white mb-4">{label}</p>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-zinc-500 w-24 shrink-0">{left}</span>
        <div className="grid grid-cols-5 gap-2 flex-1">
          {[1, 2, 3, 4, 5].map((option) => {
            const active = value === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(option as ScaleValue)}
                className={`h-11 rounded-xl border text-sm transition-colors ${
                  active
                    ? 'border-white/20 bg-white text-black'
                    : 'border-white/8 bg-black/10 text-zinc-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
        <span className="text-[11px] text-zinc-500 w-24 shrink-0 text-right">{right}</span>
      </div>
    </div>
  )
}

function buildBio(form: FormState) {
  return [
    `${form.name.trim()} quiere operar con un agente de rol ${safeFallback(form.roleLabel)}.`,
    `Emocionalmente se define como: ${safeFallback(form.emotionalTone)}.`,
    `Se motiva por ${safeFallback(form.emotionalDrive)} y le importa especialmente ${safeFallback(form.workplacePriority)}.`,
    `Su match ideal se parece a esto: ${safeFallback(form.idealMatch)}.`,
  ].join(' ')
}

function summarizeLifestyle(form: FormState) {
  return {
    order: form.lifestyleScores.order,
    socialization: form.lifestyleScores.socialization,
    learningPace: form.lifestyleScores.learningPace,
    techSpillover: form.lifestyleScores.techSpillover,
    freeTimeStyle: form.freeTimeStyle.trim(),
    hobbyRecharge: form.hobbyRecharge.trim(),
  }
}

function safeFallback(value: string) {
  return value.trim() || 'sin detalle adicional'
}

function normalizeGithubUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const isGithubHost =
      parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com'

    return isGithubHost ? parsed.toString() : null
  } catch {
    return null
  }
}

function limitText(value: string, max: number) {
  return value.slice(0, max)
}

function inferAgentRole(roleLabel: string): AgentRole {
  const normalized = roleLabel.trim().toLowerCase()
  const founderSignals = [
    'founder',
    'startup',
    'ceo',
    'cofounder',
    'co-founder',
    'hiring',
    'equipo',
    'company',
    'empresa',
    'venture',
  ]

  return founderSignals.some((signal) => normalized.includes(signal)) ? 'founder' : 'talent'
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-base text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-colors'
