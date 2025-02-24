'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { embeddingsService } from '@/lib/services/embeddings.service'

interface ScholarshipFormData {
  title: string
  description: string
  amount: string
  deadline: string
  eligibility_criteria: {
    gpa_requirement?: string
    education_level?: string[]
    major_restrictions?: string[]
    other_requirements?: string[]
  }
}

export default function NewScholarship() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ScholarshipFormData>({
    title: '',
    description: '',
    amount: '',
    deadline: '',
    eligibility_criteria: {
      gpa_requirement: '',
      education_level: [],
      major_restrictions: [],
      other_requirements: [],
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate embedding for the scholarship data
      const textToEmbed = [
        formData.title,
        formData.description,
        formData.eligibility_criteria.education_level?.join(', '),
        formData.eligibility_criteria.major_restrictions?.join(', '),
        formData.eligibility_criteria.other_requirements?.join(', '),
      ].filter(Boolean).join(' | ')

      const { embedding, warning } = await embeddingsService.generateEmbedding(textToEmbed)

      if (!embedding) {
        throw new Error('Failed to generate embedding')
      }

      // Create scholarship through the API
      const response = await fetch('/api/scholarships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          amount: parseFloat(formData.amount),
          deadline: formData.deadline,
          eligibility_criteria: formData.eligibility_criteria,
          vector_embedding: embedding,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create scholarship')
      }

      router.push('/dashboard/scholarships')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Scholarship</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            required
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            required
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="gpa" className="block text-sm font-medium text-gray-700">
            Minimum GPA Requirement
          </label>
          <input
            type="number"
            id="gpa"
            min="0"
            max="4"
            step="0.1"
            value={formData.eligibility_criteria.gpa_requirement}
            onChange={(e) =>
              setFormData({
                ...formData,
                eligibility_criteria: {
                  ...formData.eligibility_criteria,
                  gpa_requirement: e.target.value,
                },
              })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Creating...' : 'Create Scholarship'}
        </button>
      </form>
    </div>
  )
} 