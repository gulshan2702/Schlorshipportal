'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/config'
import { BarChart, LineChart } from '@/components/analytics/charts'
import { StatsCard } from '@/components/analytics/stats-card'
import { useAuth } from '@/lib/context/auth-context'

interface AnalyticsData {
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  matchQuality: number
  applicationsByMonth: {
    month: string
    count: number
  }[]
  matchesByCategory: {
    category: string
    count: number
  }[]
}

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<AnalyticsData>({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    matchQuality: 0,
    applicationsByMonth: [],
    matchesByCategory: [],
  })

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single()

      if (!profile) return

      // Get applications statistics
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (
            title,
            amount,
            eligibility_criteria
          )
        `)
        .eq('student_id', profile.id)

      if (applicationsError) throw applicationsError

      // Calculate statistics
      const stats = calculateStatistics(applications)
      setData(stats)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStatistics = (applications: any[]): AnalyticsData => {
    const now = new Date()
    const monthsData = new Map<string, number>()
    const categoriesData = new Map<string, number>()
    let totalMatchQuality = 0

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      monthsData.set(monthKey, 0)
    }

    applications.forEach(app => {
      // Count by month
      const date = new Date(app.created_at)
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (monthsData.has(monthKey)) {
        monthsData.set(monthKey, (monthsData.get(monthKey) || 0) + 1)
      }

      // Count by category
      const categories = app.scholarships.eligibility_criteria.education_level || []
      categories.forEach((category: string) => {
        categoriesData.set(category, (categoriesData.get(category) || 0) + 1)
      })

      // Calculate match quality (simplified version)
      totalMatchQuality += app.scholarships.amount > 5000 ? 1 : 0.5
    })

    return {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      matchQuality: applications.length > 0 ? (totalMatchQuality / applications.length) * 100 : 0,
      applicationsByMonth: Array.from(monthsData.entries()).map(([month, count]) => ({
        month,
        count,
      })),
      matchesByCategory: Array.from(categoriesData.entries()).map(([category, count]) => ({
        category,
        count,
      })),
    }
  }
 /*
  if (loading) {
    return <div className="text-center p-6">Loading analytics...</div>
  } */

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Applications"
          value={data.totalApplications}
          description="Total number of scholarships applied"
        />
        <StatsCard
          title="Pending Applications"
          value={data.pendingApplications}
          description="Applications awaiting response"
        />
        <StatsCard
          title="Approved Applications"
          value={data.approvedApplications}
          description="Successfully approved applications"
        />
        <StatsCard
          title="Match Quality"
          value={`${Math.round(data.matchQuality)}%`}
          description="Overall match quality score"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applications Over Time</h2>
          <LineChart
            data={data.applicationsByMonth}
            xKey="month"
            yKey="count"
            xLabel="Month"
            yLabel="Applications"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Applications by Category</h2>
          <BarChart
            data={data.matchesByCategory}
            xKey="category"
            yKey="count"
            xLabel="Category"
            yLabel="Applications"
          />
        </div>
      </div>
    </div>
  )
} 