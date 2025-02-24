'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Scholarship = Database['public']['Tables']['scholarships']['Row']

interface MatchResult {
  scholarship: Scholarship
  similarity: number
  matchReason: string[]
}

export default function Matches() {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (!response.ok) throw new Error('Failed to fetch matches')
      
      const data = await response.json()
      setMatches(data.matches)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center p-6">Finding your matches...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your Matched Scholarships</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {matches.map(({ scholarship, similarity, matchReason }) => (
          <div
            key={scholarship.id}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{scholarship.title}</h3>
              <span className="text-sm text-blue-600 font-medium">
                {Math.round(similarity * 100)}% Match
              </span>
            </div>
            <p className="text-gray-600 line-clamp-2 mb-4">{scholarship.description}</p>
            <div className="space-y-2 mb-4">
              <p className="text-green-600 font-medium">
                ${scholarship.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                Deadline: {new Date(scholarship.deadline!).toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Why this matches you:</h4>
              <ul className="text-sm text-gray-600">
                {matchReason.map((reason, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/dashboard/scholarships/${scholarship.id}`}
              className="block text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
          <p className="mt-2 text-gray-600">
            Try updating your profile with more information to find better matches.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Update Profile
          </Link>
        </div>
      )}
    </div>
  )
} 