'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, Home, Download } from 'lucide-react'
import Link from 'next/link'
import { scholarshipService } from '@/lib/services/scholarship.service'
import { Database } from '@/types/supabase'
import { toast } from 'sonner'

type Scholarship = Database['public']['Tables']['scholarships']['Row']

interface FilterState {
  caste: string[]
  type: string[]
  state: string
  religion: string[]
  institutionType: string[]
  minAmount: string
  maxAmount: string
  deadline: string
  educationLevel: string[]
  status: string[]
}

const EDUCATION_LEVELS = [
  'High School',
  'Undergraduate',
  'Graduate',
  'Doctoral',
  'Post-Doctoral'
]

const SCHOLARSHIP_TYPES = [
  'Merit-based',
  'Need-based',
  'Research',
  'Sports',
  'Cultural',
  'Community Service'
]

const RELIGIONS = [
  'Hindu',
  'Muslim',
  'Christian',
  'Sikh',
  'Buddhist',
  'Jain',
  'Other'
]

const INSTITUTION_TYPES = [
  'Government',
  'Private',
  'Deemed University',
  'Autonomous'
]

const STATES = [
  'All States',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
]

const STATUSES = [
  'Available',
  'Limited',
  'New',
  'Closing Soon'
]

export default function FilterScholarships() {
  const [filters, setFilters] = useState<FilterState>({
    caste: [],
    type: [],
    state: 'All States',
    religion: [],
    institutionType: [],
    minAmount: '',
    maxAmount: '',
    deadline: '',
    educationLevel: [],
    status: []
  })

  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleCheckboxChange = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      if (Array.isArray(prev[category])) {
        const currentValues = prev[category] as string[]
        return {
          ...prev,
          [category]: currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value]
        }
      }
      return prev
    })
  }

  const handleStateChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      state: value
    }))
  }

  const handleReset = () => {
    setFilters({
      caste: [],
      type: [],
      state: 'All States',
      religion: [],
      institutionType: [],
      minAmount: '',
      maxAmount: '',
      deadline: '',
      educationLevel: [],
      status: []
    })
    loadScholarships()
  }

  const handleApplyFilters = async () => {
    setLoading(true)
    try {
      const filteredData = await scholarshipService.filter({
        ...filters,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined
      })
      setScholarships(filteredData)
      toast.success('Filters applied successfully')
    } catch (error) {
      console.error('Error applying filters:', error)
      toast.error('Failed to apply filters')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    try {
      const csvContent = [
        ['Title', 'Description', 'Amount', 'Deadline', 'Category', 'Status'],
        ...scholarships.map(s => [
          s.title,
          s.description,
          s.amount.toString(),
          s.deadline,
          s.category,
          s.status
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scholarships.csv'
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Failed to export data')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-gray-900">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/scholarships" className="hover:text-gray-900">
            Scholarships
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>Filter</span>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Amount Range */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Amount Range</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Minimum Amount</label>
              <input
                type="number"
                min="0"
                value={filters.minAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Maximum Amount</label>
              <input
                type="number"
                min="0"
                value={filters.maxAmount}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Deadline</h2>
          <div>
            <label className="block text-sm text-gray-700">Before Date</label>
            <input
              type="date"
              value={filters.deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilters(prev => ({ ...prev, deadline: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            {STATUSES.map(status => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.status.includes(status)}
                  onChange={() => handleCheckboxChange('status', status)}
                />
                <span className="ml-2 text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Caste Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Caste Category</h2>
          <div className="space-y-2">
            {['SC', 'ST', 'OBC', 'General'].map(caste => (
              <label key={caste} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.caste.includes(caste)}
                  onChange={() => handleCheckboxChange('caste', caste)}
                />
                <span className="ml-2 text-sm text-gray-700">{caste}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Scholarship Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Scholarship Type</h2>
          <div className="space-y-2">
            {SCHOLARSHIP_TYPES.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.type.includes(type)}
                  onChange={() => handleCheckboxChange('type', type)}
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Religion */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Religion</h2>
          <div className="space-y-2">
            {RELIGIONS.map(religion => (
              <label key={religion} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.religion.includes(religion)}
                  onChange={() => handleCheckboxChange('religion', religion)}
                />
                <span className="ml-2 text-sm text-gray-700">{religion}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Institution Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Institution Type</h2>
          <div className="space-y-2">
            {INSTITUTION_TYPES.map(type => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.institutionType.includes(type)}
                  onChange={() => handleCheckboxChange('institutionType', type)}
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* State */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">State</h2>
          <select
            value={filters.state}
            onChange={(e) => handleStateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Education Level */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Education Level</h2>
          <div className="space-y-2">
            {EDUCATION_LEVELS.map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600"
                  checked={filters.educationLevel.includes(level)}
                  onChange={() => handleCheckboxChange('educationLevel', level)}
                />
                <span className="ml-2 text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApplyFilters}
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Applying...' : 'Apply Filters'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {loading ? 'Loading scholarships...' : `${scholarships.length} Scholarships Found`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scholarships.map((scholarship) => (
            <div key={scholarship.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{scholarship.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{scholarship.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  scholarship.status === 'Available' ? 'bg-green-100 text-green-800' :
                  scholarship.status === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                  scholarship.status === 'New' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {scholarship.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">${scholarship.amount.toLocaleString()}</p>
                <p className="mt-1 text-sm text-gray-500">Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</p>
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
      </div>
    </div>
  )
} 