'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/config'
import { Database } from '@/types/supabase'

type Scholarship = Database['public']['Tables']['scholarships']['Row']

export default function ScholarshipDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    loadScholarship()
  }, [params.id])

  const loadScholarship = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setScholarship(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    setApplying(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!profile) {
        router.push('/dashboard/profile')
        return
      }

      const { error } = await supabase.from('applications').insert({
        student_id: profile.id,
        scholarship_id: params.id,
        status: 'pending'
      })

      if (error) throw error

      alert('Application submitted successfully!')
      router.push('/dashboard/applications')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="text-center p-6">Loading scholarship details...</div>
  }

  if (!scholarship) {
    return <div className="text-center p-6">Scholarship not found</div>
  } 

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">{scholarship.title}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Description</h2>
            <p className="mt-2 text-gray-600">{scholarship.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-medium text-gray-900">Amount</h2>
              <p className="mt-2 text-green-600 font-medium">
                ${scholarship.amount.toLocaleString()}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">Deadline</h2>
              <p className="mt-2 text-gray-600">
                {new Date(scholarship.deadline!).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium text-gray-900">Eligibility Criteria</h2>
            <div className="mt-2 space-y-2">
              {scholarship.eligibility_criteria?.gpa_requirement && (
                <p className="text-gray-600">
                  Minimum GPA: {scholarship.eligibility_criteria.gpa_requirement}
                </p>
              )}
              {scholarship.eligibility_criteria?.education_level && scholarship.eligibility_criteria.education_level.length > 0 && (
                <p className="text-gray-600">
                  Education Level: {scholarship.eligibility_criteria.education_level.join(', ')}
                </p>
              )}
              {scholarship.eligibility_criteria?.major_restrictions && scholarship.eligibility_criteria.major_restrictions.length > 0 && (
                <p className="text-gray-600">
                  Major Restrictions: {scholarship.eligibility_criteria.major_restrictions.join(', ')}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {applying ? 'Submitting Application...' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  )
} 