'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function EditTalentProfile() {
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        const { data: profile, error } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error || !profile) {
          router.push('/dashboard/talent')
          return
        }

        setFormData({
          bio: profile.bio || '',
          skills: profile.skills || [],
          experience_years: profile.experience_years || 0,
          technologies: profile.technologies || [],
          github_url: profile.github_url || '',
          linkedin_url: profile.linkedin_url || '',
        })
      } catch (err) {
        console.error('Error loading profile:', err)
        router.push('/dashboard/talent')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

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

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const profileData = {
        bio: formData.bio,
        skills: formData.skills,
        experience_years: formData.experience_years,
        technologies: formData.technologies,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
      }

      const { error: updateError } = await supabase
        .from('candidate_profiles')
        .update(profileData)
        .eq('user_id', user.id)

      if (updateError) {
        throw updateError
      }

      console.log('✅ Profile updated successfully!')
      router.push('/dashboard/talent')
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update profile')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white border border-secondary rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-playfair font-bold text-primary">
              Edit Your Profile
            </h1>
            <Link href="/dashboard/talent" className="text-primary/70 hover:text-primary">
              ← Back
            </Link>
          </div>
          <p className="text-primary/70 mb-8">Update your profile to showcase your latest skills and experience</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">About You</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Describe your professional background, interests, and what you're looking for in a startup..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-xs text-primary/60 mt-1">{formData.bio.length} characters</p>
            </div>

            {/* Experience Years */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Years of Experience</label>
              <select
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary focus:outline-none focus:border-primary"
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
              <label className="block text-sm font-medium mb-2 text-primary">Skills (Press Enter to add)</label>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="e.g., React, Node.js, Python..."
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-2">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(i)}
                      className="hover:text-secondary"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">Technologies (Press Enter to add)</label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTechnology}
                placeholder="e.g., TypeScript, PostgreSQL, AWS..."
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technologies.map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-secondary text-primary rounded-full text-sm flex items-center gap-2">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(i)}
                      className="hover:text-red-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">GitHub URL (Optional)</label>
              <input
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">LinkedIn URL (Optional)</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2 bg-background border border-secondary rounded-lg text-primary placeholder-primary/50 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-primary text-white hover:bg-opacity-90 disabled:opacity-50 rounded-full font-semibold transition-all mt-8"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
