'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setAgentSession } from '@/lib/agent-session'

export default function CandidateOnboarding() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    bio: '',
    skills: [] as string[],
    experienceYears: 0,
    technologies: [] as string[],
    githubUrl: '',
    linkedinUrl: '',
    values: [] as string[],
    communicationStyle: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [valueInput, setValueInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? parseInt(value, 10) : value,
    }))
  }

  const addTag = (
    event: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    key: 'skills' | 'technologies' | 'values',
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

  const removeTag = (key: 'skills' | 'technologies' | 'values', index: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Tu nombre es obligatorio.')
      return
    }

    if (!formData.bio.trim() || formData.bio.trim().length < 10) {
      setError('La bio debe tener al menos 10 caracteres.')
      return
    }

    if (formData.skills.length === 0) {
      setError('Agregá al menos una skill.')
      return
    }

    setLoading(true)

    try {
      const response = await api.createAgent({
        name: formData.name.trim(),
        age: formData.age || undefined,
        location: formData.location || undefined,
        bio: formData.bio.trim(),
        personal: {
          values: formData.values,
        },
        social: {
          communicationStyle: formData.communicationStyle || 'directa y colaborativa',
        },
        professional: {
          role: 'Talent',
          skills: formData.skills,
          experienceYears: formData.experienceYears,
          technologies: formData.technologies,
        },
        extra: {
          githubUrl: formData.githubUrl || undefined,
          linkedinUrl: formData.linkedinUrl || undefined,
        },
      })

      setAgentSession({
        activeAgentId: response.agent.id,
        activeAgentName: formData.name.trim(),
        role: 'talent',
        grading: response.grading,
      })

      router.push('/dashboard/talent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu agente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Creá tu agente profesional
          </h1>
          <p className="text-slate-400 mb-8">Este formulario se envía directo al backend para perfilarte y generar tu `agentId`.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sofía"
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Edad</label>
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="28"
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ubicación</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Buenos Aires"
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Contá qué hacés, qué te interesa y qué tipo de startup querés construir."
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Años de experiencia</label>
              <select
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 15].map(year => (
                  <option key={year} value={year}>
                    {year === 0 ? 'Sin experiencia' : `${year}+ años`}
                  </option>
                ))}
              </select>
            </div>

            <TagInput
              label="Skills"
              value={skillInput}
              setValue={setSkillInput}
              onKeyDown={(event) => addTag(event, skillInput, 'skills', () => setSkillInput(''))}
              items={formData.skills}
              onRemove={(index) => removeTag('skills', index)}
              placeholder="React, Product, Sales..."
              tone="purple"
            />

            <TagInput
              label="Tecnologías"
              value={techInput}
              setValue={setTechInput}
              onKeyDown={(event) => addTag(event, techInput, 'technologies', () => setTechInput(''))}
              items={formData.technologies}
              onRemove={(index) => removeTag('technologies', index)}
              placeholder="TypeScript, Node.js, LLMs..."
              tone="pink"
            />

            <TagInput
              label="Valores"
              value={valueInput}
              setValue={setValueInput}
              onKeyDown={(event) => addTag(event, valueInput, 'values', () => setValueInput(''))}
              items={formData.values}
              onRemove={(index) => removeTag('values', index)}
              placeholder="Honestidad, autonomía..."
              tone="violet"
            />

            <div>
              <label className="block text-sm font-medium mb-2">Estilo de comunicación</label>
              <input
                name="communicationStyle"
                value={formData.communicationStyle}
                onChange={handleChange}
                placeholder="Directa pero cálida"
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">GitHub</label>
                <input
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                <input
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg font-semibold transition-all"
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
  placeholder,
  tone,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  items: string[]
  onRemove: (index: number) => void
  placeholder: string
  tone: 'purple' | 'pink' | 'violet'
}) {
  const toneClass = tone === 'pink' ? 'bg-pink-600' : 'bg-purple-600'

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label} (Enter para agregar)</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
      />
      <div className="flex flex-wrap gap-2 mt-3">
        {items.map((item, index) => (
          <span key={`${label}-${item}-${index}`} className={`px-3 py-1 ${toneClass} rounded-full text-sm flex items-center gap-2`}>
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
