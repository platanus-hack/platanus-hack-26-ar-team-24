'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const addStack = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (stackInput.trim()) {
        setFormData(prev => ({
          ...prev,
          stack: [...prev.stack, stackInput.trim()],
        }))
        setStackInput('')
      }
    }
  }

  const removeStack = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stack: prev.stack.filter((_, i) => i !== index),
    }))
  }

  const addCulture = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (cultureInput.trim()) {
        setFormData(prev => ({
          ...prev,
          culture_values: [...prev.culture_values, cultureInput.trim()],
        }))
        setCultureInput('')
      }
    }
  }

  const removeCulture = (index: number) => {
    setFormData(prev => ({
      ...prev,
      culture_values: prev.culture_values.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Startup name is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    if (formData.description.length < 20) {
      setError('Description must be at least 20 characters')
      return
    }

    if (formData.stack.length === 0) {
      setError('Add at least one technology to your stack')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('Creating startup profile for user:', user.id)

      // First, ensure the user exists in public.users
      const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'user'

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!existingUser) {
        console.log('Creating user record in public.users')
        const { error: userError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            username: username,
            user_type: 'founder',
            password_hash: 'oauth_user',
          }])

        if (userError) {
          console.error('User insert error:', userError)
          throw userError
        }
      }

      const profileData = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        stack: formData.stack,
        culture_values: formData.culture_values,
      }

      console.log('Profile data:', profileData)

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('startup_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('Existing profile:', existing)

      let result
      if (existing) {
        console.log('Updating existing profile')
        result = await supabase
          .from('startup_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
      } else {
        console.log('Inserting new profile')
        result = await supabase
          .from('startup_profiles')
          .insert([profileData])
          .select()
      }

      console.log('Save result:', result)

      if (result.error) {
        console.error('Save error details:', result.error)
        throw result.error
      }

      console.log('✅ Startup profile saved! Redirecting...')
      router.push('/dashboard/founder')
    } catch (err: any) {
      console.error('Full error:', err)
      setError(err.message || 'Failed to create startup profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 border border-pink-500/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
            Create Your Startup Profile
          </h1>
          <p className="text-slate-400 mb-8">Tell us about your vision and what you're looking for in team members</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Startup Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Startup Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., TechAI Inc"
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">What does your startup do?</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your startup's mission, what problems you solve, and your vision for the future..."
                rows={5}
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.description.length} characters (min 20)</p>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium mb-2">Technology Stack (Press Enter to add)</label>
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={addStack}
                placeholder="e.g., React, Node.js, PostgreSQL..."
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.stack.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-pink-600 rounded-full text-sm flex items-center gap-2">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeStack(i)}
                      className="hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Culture Values */}
            <div>
              <label className="block text-sm font-medium mb-2">Culture Values (Press Enter to add)</label>
              <input
                type="text"
                value={cultureInput}
                onChange={(e) => setCultureInput(e.target.value)}
                onKeyDown={addCulture}
                placeholder="e.g., Innovation, Collaboration, Transparency..."
                className="w-full px-4 py-2 bg-slate-700 border border-pink-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.culture_values.map((value, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-600 rounded-full text-sm flex items-center gap-2">
                    {value}
                    <button
                      type="button"
                      onClick={() => removeCulture(i)}
                      className="hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-all mt-8"
            >
              {loading ? 'Creating Startup Profile...' : 'Create Startup Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
