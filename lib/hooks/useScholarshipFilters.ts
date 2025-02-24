import { useState, useEffect, useMemo } from 'react'
import { Database } from '@/types/supabase'

type Scholarship = Database['public']['Tables']['scholarships']['Row']

export interface ScholarshipFilters {
  searchTerm: string
  minAmount: string
  maxAmount: string
  educationLevel: string
  deadline: string
}

export function useScholarshipFilters(scholarships: Scholarship[]) {
  const [filters, setFilters] = useState<ScholarshipFilters>({
    searchTerm: '',
    minAmount: '',
    maxAmount: '',
    educationLevel: '',
    deadline: '',
  })

  const filteredScholarships = useMemo(() => {
    let filtered = [...scholarships]

    // Search term filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        scholarship =>
          scholarship.title.toLowerCase().includes(term) ||
          scholarship.description.toLowerCase().includes(term)
      )
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(
        scholarship => scholarship.amount >= parseFloat(filters.minAmount)
      )
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(
        scholarship => scholarship.amount <= parseFloat(filters.maxAmount)
      )
    }

    // Education level filter
    if (filters.educationLevel) {
      filtered = filtered.filter(scholarship =>
        (scholarship.eligibility_criteria as any).education_level?.includes(filters.educationLevel)
      )
    }

    // Deadline filter
    if (filters.deadline) {
      const today = new Date()
      const deadlineDate = new Date(filters.deadline)
      filtered = filtered.filter(scholarship => {
        if (!scholarship.deadline) return false
        const scholarshipDeadline = new Date(scholarship.deadline)
        return scholarshipDeadline >= today && scholarshipDeadline <= deadlineDate
      })
    }

    return filtered
  }, [scholarships, filters])

  const updateFilter = (key: keyof ScholarshipFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      minAmount: '',
      maxAmount: '',
      educationLevel: '',
      deadline: '',
    })
  }

  return {
    filters,
    filteredScholarships,
    updateFilter,
    resetFilters,
  }
} 