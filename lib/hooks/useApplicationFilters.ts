import { useMemo, useState } from 'react'
import { Database } from '@/types/supabase'

type Application = Database['public']['Tables']['applications']['Row'] & {
  scholarships: Database['public']['Tables']['scholarships']['Row']
}

export interface ApplicationFilters {
  searchTerm: string
  status: string
  dateRange: {
    start: string
    end: string
  }
  minAmount: string
  maxAmount: string
  sortBy: 'date' | 'amount' | 'status'
  sortOrder: 'asc' | 'desc'
  page: number
  pageSize: number
}

export function useApplicationFilters(applications: Application[]) {
  const [filters, setFilters] = useState<ApplicationFilters>({
    searchTerm: '',
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  })

  const filteredApplications = useMemo(() => {
    let filtered = applications.filter((application) => {
      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        const matchesTitle = application.scholarships.title.toLowerCase().includes(searchTerm)
        const matchesDescription = application.scholarships.description.toLowerCase().includes(searchTerm)
        if (!matchesTitle && !matchesDescription) return false
      }

      // Status filter
      if (filters.status && application.status !== filters.status) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const applicationDate = new Date(application.created_at)
        if (filters.dateRange.start && applicationDate < new Date(filters.dateRange.start)) {
          return false
        }
        if (filters.dateRange.end && applicationDate > new Date(filters.dateRange.end)) {
          return false
        }
      }

      // Amount range filter
      if (filters.minAmount && application.scholarships.amount < parseFloat(filters.minAmount)) {
        return false
      }
      if (filters.maxAmount && application.scholarships.amount > parseFloat(filters.maxAmount)) {
        return false
      }

      return true
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return filters.sortOrder === 'desc'
            ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'amount':
          return filters.sortOrder === 'desc'
            ? b.scholarships.amount - a.scholarships.amount
            : a.scholarships.amount - b.scholarships.amount
        case 'status':
          return filters.sortOrder === 'desc'
            ? b.status.localeCompare(a.status)
            : a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    // Apply pagination
    const startIndex = (filters.page - 1) * filters.pageSize
    const endIndex = startIndex + filters.pageSize
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
    }
  }, [applications, filters])

  const updateFilter = (key: keyof ApplicationFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
      dateRange: {
        start: '',
        end: '',
      },
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc',
      page: 1,
      pageSize: 10,
    })
  }

  return {
    filters,
    filteredApplications,
    updateFilter,
    resetFilters,
  }
} 