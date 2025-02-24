'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/config'
import Link from 'next/link'
import { Database } from '@/types/supabase'
import { useAuth } from '@/lib/context/auth-context'
import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription'
import { useApplicationFilters } from '@/lib/hooks/useApplicationFilters'
import { usePagination } from '@/lib/hooks/usePagination'
import { Pagination } from '@/components/common/pagination'

type Application = Database['public']['Tables']['applications']['Row'] & {
  scholarships: Database['public']['Tables']['scholarships']['Row']
}

export default function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const { filters, filteredApplications, updateFilter, resetFilters } = useApplicationFilters(applications)
  const pagination = usePagination({
    totalItems: filteredApplications.totalItems,
    pageSize: filters.pageSize,
    currentPage: filters.page,
  })

  const loadApplications = useCallback(async () => {
    if (!profileId) return

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (*)
        `)
        .eq('student_id', profileId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data as Application[])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [profileId])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setProfileId(profile.id)
      }
    }

    fetchProfile()
  }, [user])

  useEffect(() => {
    if (profileId) {
      loadApplications()
    }
  }, [profileId, loadApplications])

  const handleRealtimeUpdate = useCallback(
    (updatedApplication: Application) => {
      setApplications((current) => {
        const index = current.findIndex((app) => app.id === updatedApplication.id)
        if (index === -1) {
          // New application
          return [...current, updatedApplication].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        } else {
          // Updated application
          const newApplications = [...current]
          newApplications[index] = {
            ...newApplications[index],
            ...updatedApplication,
          }
          return newApplications
        }
      })
    },
    []
  )

  useRealtimeSubscription<Application>(
    'applications',
    handleRealtimeUpdate,
    profileId ? { field: 'student_id', value: profileId } : undefined
  )

  if (loading) {
    return <div className="text-center p-6">Loading applications...</div>
  } 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Applications</h1>
        <button
          onClick={resetFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Reset Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <input
              type="text"
              placeholder="Search applications..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() =>
                updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
              }
              className="px-3 py-2 border rounded-md"
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div>
            <select
              value={filters.pageSize}
              onChange={(e) => {
                updateFilter('pageSize', Number(e.target.value))
                updateFilter('page', 1) // Reset to first page when changing page size
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredApplications.items.map((application) => (
            <li key={application.id} className="animate-fade-in">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {application.scholarships.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      application.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Applied on: {new Date(application.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amount: ${application.scholarships.amount.toLocaleString()}
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/dashboard/scholarships/${application.scholarship_id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Scholarship Details
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Pagination
          {...pagination}
          onPageChange={(page) => updateFilter('page', page)}
        />
      </div>

      {filteredApplications.totalItems === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
          <p className="mt-2 text-gray-600">
            {applications.length === 0
              ? 'Start exploring scholarships and submit your first application.'
              : 'Try adjusting your filters to see more applications.'}
          </p>
          {applications.length === 0 ? (
            <Link
              href="/dashboard/scholarships"
              className="mt-4 inline-block text-blue-600 hover:text-blue-800"
            >
              Browse Scholarships
            </Link>
          ) : (
            <button
              onClick={resetFilters}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
} 