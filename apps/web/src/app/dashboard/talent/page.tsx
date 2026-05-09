'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function TalentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log('No session found, redirecting to auth')
          router.push('/auth')
          return
        }

        console.log('✅ Session found for user:', session.user.id)
        setUser(session.user)

        // Load candidate profile from Supabase
        console.log('Loading candidate profile for user:', session.user.id)
        const { data: profile, error } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        console.log('Profile load result:', { profile, error })

        if (error || !profile) {
          console.log('No profile found - showing complete profile prompt')
          setHasProfile(false)
        } else {
          console.log('✅ Profile found, setting data:', profile)
          setProfileData(profile)
          setHasProfile(true)
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setHasProfile(false)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Complete Your Profile First</h2>
            <p className="text-slate-400 mb-6">Create your candidate profile to get matched with startups looking for talent like you.</p>
            <Link href="/onboarding/candidate" className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
              Create Candidate Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const username = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Welcome, {username}!
            </h1>
            <p className="text-slate-400">Your profile is live and founders can now see you in AI-powered matching</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {/* Profile Summary */}
        {profileData && (
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">About You</h3>
                <p className="text-slate-300">{profileData.bio}</p>
              </div>

              {/* Experience */}
              <div>
                <h3 className="font-semibold text-purple-400 mb-2">Experience</h3>
                <p className="text-slate-300">{profileData.experience_years} years</p>
              </div>

              {/* Skills */}
              {profileData.skills && profileData.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-purple-400 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {profileData.technologies && profileData.technologies.length > 0 && (
                <div>
                  <h3 className="font-semibold text-purple-400 mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.technologies.map((tech: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-pink-600 rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4">
                {profileData.github_url && (
                  <a
                    href={profileData.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                  >
                    GitHub
                  </a>
                )}
                {profileData.linkedin_url && (
                  <a
                    href={profileData.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Waiting for Matches */}
        <div className="text-center py-12 bg-slate-800/30 border border-purple-500/20 rounded-xl">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-xl font-bold mb-2">Waiting for Matches</h3>
          <p className="text-slate-400">
            Founders are using our AI agents to find talent. When a founder's AI agent finds you're a match, you'll be notified!
          </p>
        </div>
      </div>
    </div>
  )
}
