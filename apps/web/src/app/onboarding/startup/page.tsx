'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setAgentSession } from '@/lib/agent-session'

export default function StartupOnboarding() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    startupName: '',
    founderName: '',
    location: '',
    description: '',
    stack: [] as string[],
    cultureValues: [] as string[],
    hiringGoal: '',
  })
  const [stackInput, setStackInput] = useState('')
  const [cultureInput, setCultureInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const addTag = (
    event: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    key: 'stack' | 'cultureValues',
    clear: () => void
  ) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (!input.trim()) return

    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], input.trim()],
    }))
    clear()
  }

  const removeTag = (key: 'stack' | 'cultureValues', index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.startupName.trim()) {
      setError('El nombre de la startup es obligatorio.')
      return
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      setError('La descripción debe tener al menos 20 caracteres.')
      return
    }

    if (formData.stack.length === 0) {
      setError('Agregá al menos una tecnología o capability clave.')
      return
    }

    setLoading(true)

    try {
      const response = await api.createAgent({
        name: formData.startupName.trim(),
        location: formData.location || undefined,
        bio: formData.description.trim(),
        personal: {
          values: formData.cultureValues,
        },
        social: {
          communicationStyle: 'directa y orientada a ejecución',
        },
        professional: {
          role: 'Founder',
          skills: formData.stack,
        },
        extra: {
          startupName: formData.startupName.trim(),
          founderName: formData.founderName || undefined,
          hiringGoal: formData.hiringGoal || undefined,
        },
      })

      setAgentSession({
        activeAgentId: response.agent.id,
        activeAgentName: formData.startupName.trim(),
        role: 'founder',
        grading: response.grading,
      })

      router.push('/dashboard/founder')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu agente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 border border-pink-500/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Creá tu agente de startup
          </h1>
          <p className="text-slate-400 mb-8">El backend perfila la startup y devuelve un `agentId` reutilizable para matchmaking.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Startup</label>
                <input
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleChange}
                  placeholder="AgentLink"
                  className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Founder</label>
                <input
                  name="founderName"
                  value={formData.founderName}
                  onChange={handleChange}
                  placeholder="Matías"
                  className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ubicación</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Buenos Aires"
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Qué problema resuelven, a quién le venden y qué tipo de equipo quieren formar."
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <TagInput
              label="Stack o capacidades"
              value={stackInput}
              setValue={setStackInput}
              onKeyDown={(event) => addTag(event, stackInput, 'stack', () => setStackInput(''))}
              items={formData.stack}
              onRemove={(index) => removeTag('stack', index)}
            />

            <TagInput
              label="Valores culturales"
              value={cultureInput}
              setValue={setCultureInput}
              onKeyDown={(event) => addTag(event, cultureInput, 'cultureValues', () => setCultureInput(''))}
              items={formData.cultureValues}
              onRemove={(index) => removeTag('cultureValues', index)}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Qué buscás contratar</label>
              <input
                name="hiringGoal"
                value={formData.hiringGoal}
                onChange={handleChange}
                placeholder="Founding engineer con foco en AI recruiting"
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-all"
            >
              {loading ? 'Creando agente...' : 'Crear agente'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function TagInput({
  label,
  value,
  setValue,
  onKeyDown,
  items,
  onRemove,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  items: string[]
  onRemove: (index: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label} (Enter para agregar)</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {items.map((item, index) => (
          <span key={`${label}-${item}-${index}`} className="px-3 py-1 bg-pink-600 rounded-full text-sm flex items-center gap-2">
            {item}
            <button type="button" onClick={() => onRemove(index)} className="hover:text-red-300">
              x
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
