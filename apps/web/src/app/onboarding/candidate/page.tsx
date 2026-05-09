'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' ? parseInt(value) : value,
    }))
  }

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (skillInput.trim()) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }))
        setSkillInput('')
      }
    }
  }

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const addTechnology = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (techInput.trim()) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, techInput.trim()],
        }))
        setTechInput('')
      }
    }
  }

  const removeTechnology = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.bio.trim()) {
      setError('Bio is required')
      return
    }

    if (formData.bio.length < 10) {
      setError('Bio must be at least 10 characters')
      return
    }

    if (formData.skills.length === 0) {
      setError('Add at least one skill')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('Creating profile for user:', user.id)

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
            user_type: 'talent',
            password_hash: 'oauth_user',
          }])

        if (userError) {
          console.error('User insert error:', userError)
          throw userError
        }
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

      console.log('Profile data:', profileData)

      // Check if profile already exists
      const { data: existing } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log('Existing profile:', existing)

      let result
      if (existing) {
        console.log('Updating existing profile')
        result = await supabase
          .from('candidate_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
      } else {
        console.log('Inserting new profile')
        result = await supabase
          .from('candidate_profiles')
          .insert([profileData])
          .select()
      }

      console.log('Save result:', result)

      if (result.error) {
        console.error('Save error details:', result.error)
        throw result.error
      }

      console.log('✅ Profile saved! Redirecting...')
      router.push('/dashboard/talent')
    } catch (err: any) {
      console.error('Full error:', err)
      setError(err.message || 'Failed to create profile')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-slate-800/50 border border-purple-500/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Create Your Profile
          </h1>
          <p className="text-slate-400 mb-8">Tell us about yourself to get matched with the perfect startup</p>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2">About You</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your professional background, interests, and what you're looking for in a startup..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">{formData.bio.length} characters</p>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium mb-2">Years of Experience</label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(year => (
                  <option key={year} value={year}>
                    {year === 0 ? 'No experience' : `${year}+ years`}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">Skills (Press Enter to add)</label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="e.g., React, Node.js, Python..."
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-600 rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium mb-2">Technologies (Press Enter to add)</label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTechnology}
                placeholder="e.g., TypeScript, PostgreSQL, AWS..."
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technologies.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-pink-600 rounded-full text-sm flex items-center gap-2">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(i)}
                      className="hover:text-red-300"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium mb-2">GitHub URL (Optional)</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn URL (Optional)</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-lg font-semibold transition-all mt-8"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
