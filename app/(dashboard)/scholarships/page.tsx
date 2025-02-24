'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, Home, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { scholarshipService } from '@/lib/services/scholarship.service'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'
import debounce from 'lodash/debounce'

type Scholarship = Database['public']['Tables']['scholarships']['Row']

const MIN_SEARCH_LENGTH = 3
const DEBOUNCE_MS = 300

export default function Scholarships() {
  const [searchTerm, setSearchTerm] = useState('')
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadScholarships()
  }, [])

  const loadScholarships = async () => {
    setLoading(true)
    try {
      const data = await scholarshipService.getAll()
      setScholarships(data)
    } catch (error) {
      console.error('Error loading scholarships:', error)
      toast.error('Failed to load scholarships')
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < MIN_SEARCH_LENGTH) {
        await loadScholarships()
        setIsSearching(false)
        return
      }

      try {
        const results = await scholarshipService.search(term)
        setScholarships(results)
      } catch (error) {
        console.error('Error searching scholarships:', error)
        toast.error('Failed to search scholarships')
      } finally {
        setIsSearching(false)
      }
    }, DEBOUNCE_MS),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsSearching(true)
    debouncedSearch(term)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800'
      case 'Limited':
        return 'bg-yellow-100 text-yellow-800'
      case 'New':
        return 'bg-blue-100 text-blue-800'
      case 'Closing Soon':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/dashboard" className="flex items-center hover:text-gray-900">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Scholarships</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Available Scholarships</h1>
        <Link 
          href="/scholarships/new" 
          className="btn-primary"
        >
          Add New Scholarship
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={`Search scholarships (minimum ${MIN_SEARCH_LENGTH} characters)...`}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            </div>
          )}
        </div>
        <Link 
          href="/filter-scholarships"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Filter className="h-5 w-5 mr-2 text-gray-400" />
          Filter
        </Link>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No scholarships found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((scholarship) => (
            <div key={scholarship.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{scholarship.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{scholarship.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                  {scholarship.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">${scholarship.amount.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Deadline: {new Date(scholarship.deadline).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href={`/scholarships/${scholarship.id}`}
                  className="w-full btn-primary inline-block text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 