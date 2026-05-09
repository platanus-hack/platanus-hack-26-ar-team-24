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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-secondary rounded-3xl p-8 shadow-sm">
          <h1 className="text-3xl font-playfair font-bold mb-2 text-primary">
            Create Your Startup Profile
          </h1>
          <p className="text-primary/70 mb-8">Tell us about your vision and what you're looking for in team members</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Startup Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Startup Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., TechAI Inc"
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">What does your startup do?</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your startup's mission, what problems you solve, and your vision for the future..."
                rows={5}
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-xs text-primary/60 mt-1">{formData.description.length} characters (min 20)</p>
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Technology Stack (Press Enter to add)</label>
              <input
                type="text"
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyDown={addStack}
                placeholder="e.g., React, Node.js, PostgreSQL..."
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.stack.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-2">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeStack(i)}
                      className="hover:text-secondary"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Culture Values */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Culture Values (Press Enter to add)</label>
              <input
                type="text"
                value={cultureInput}
                onChange={(e) => setCultureInput(e.target.value)}
                onKeyDown={addCulture}
                placeholder="e.g., Innovation, Collaboration, Transparency..."
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.culture_values.map((value, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary text-primary rounded-full text-sm flex items-center gap-2">
                    {value}
                    <button
                      type="button"
                      onClick={() => removeCulture(i)}
                      className="hover:text-red-600"
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
              className="w-full py-2 bg-primary text-white hover:bg-opacity-90 disabled:opacity-50 rounded-full font-semibold transition-all mt-8"
            >
              {loading ? 'Creating Startup Profile...' : 'Create Startup Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
