'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function FounderDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [hasProfile, setHasProfile] = useState(true)
  const [matches, setMatches] = useState<any[]>([])
  const [matchingLoading, setMatchingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          router.push('/auth')
          return
        }

        setUser(session.user)

        // Load startup profile from Supabase
        const { data: profile, error } = await supabase
          .from('startup_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error || !profile) {
          setHasProfile(false)
        } else {
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

  const handleRunMatching = async () => {
    setMatchingLoading(true)
    setError('')

    try {
      // Get all candidate profiles
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidate_profiles')
        .select('*')

      if (candidatesError) throw candidatesError

      if (!candidates || candidates.length === 0) {
        setError('No candidates available yet')
        return
      }

      // Calculate match scores
      const calculatedMatches = candidates.map((candidate: any) => {
        const skillOverlap = (profileData.stack || []).filter((s: string) =>
          (candidate.skills || []).some((cs: string) => cs.toLowerCase() === s.toLowerCase()) ||
          (candidate.technologies || []).some((cs: string) => cs.toLowerCase() === s.toLowerCase())
        ).length

        const totalSkills = Math.max((profileData.stack || []).length, 1)
        const skillScore = skillOverlap / totalSkills

        const expScore = Math.min(candidate.experience_years / 10, 1)
        const score = skillScore * 0.6 + expScore * 0.4

        return {
          id: candidate.id,
          candidate_id: candidate.user_id,
          match_score: score,
          summary: `Candidate with ${candidate.experience_years} years of experience and ${(candidate.skills || []).length} skills.`,
          reasons: [
            `${skillOverlap} skills match your tech stack`,
            `${candidate.experience_years} years of experience`,
            `Skills: ${(candidate.skills || []).slice(0, 3).join(', ')}`,
          ],
          bio: candidate.bio,
          skills: candidate.skills,
          technologies: candidate.technologies,
        }
      }).sort((a: any, b: any) => b.match_score - a.match_score)

      setMatches(calculatedMatches)
    } catch (err: any) {
      setError(err.message || 'Failed to run matching')
    } finally {
      setMatchingLoading(false)
    }
  }

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
            <p className="text-slate-400 mb-6">Create your startup profile to start matching with talented candidates.</p>
            <Link href="/onboarding/startup" className="inline-block px-6 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg">
              Create Startup Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
              {profileData?.name || 'Find Your Team'}
            </h1>
            <p className="text-slate-400">Use AI-powered matching to discover the perfect team members for your startup</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Matching Button */}
        <div className="text-center">
          <button
            onClick={handleRunMatching}
            disabled={matchingLoading}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 rounded-lg font-semibold transition-all text-lg"
          >
            {matchingLoading ? '🔍 Buscando matches con agentes IA...' : '🔍 Buscar matches con agentes IA'}
          </button>
        </div>

        {/* Results */}
        {matches.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              {matches.length} Matches Found 🎯
            </h2>

            <div className="grid gap-4">
              {matches.map(match => (
                <div
                  key={match.id}
                  className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400 transition-all"
                >
                  {/* Match Score */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 mb-2">
                        Candidate Match
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="relative w-24 h-24 rounded-full border-4 border-purple-500/50 flex items-center justify-center bg-gradient-to-br from-purple-900 to-slate-900">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                              {Math.round(match.match_score * 100)}%
                            </div>
                            <div className="text-xs text-slate-500">Compatible</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {match.bio && (
                    <div className="mb-4">
                      <p className="text-slate-300 leading-relaxed italic">"{match.bio}"</p>
                    </div>
                  )}

                  {/* Reasons */}
                  <div className="mb-6 space-y-2">
                    <h4 className="font-semibold text-slate-300">Why this is a great match:</h4>
                    <ul className="space-y-1">
                      {match.reasons.map((reason: string, i: number) => (
                        <li key={i} className="text-slate-400 text-sm flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Skills */}
                  {match.skills && match.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {match.skills.slice(0, 5).map((skill: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-purple-600/40 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!matchingLoading && matches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-slate-400">Click "Buscar matches" to find candidates that match your startup</p>
          </div>
        )}
      </div>
    </div>
  )
}
