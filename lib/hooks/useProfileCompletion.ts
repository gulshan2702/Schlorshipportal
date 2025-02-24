import { useMemo } from 'react'
import { ProfileFormData } from '@/types/profile'

interface CompletionSection {
  name: string
  fields: string[]
  weight: number
}

const sections: CompletionSection[] = [
  {
    name: 'Personal Information',
    fields: ['firstName', 'lastName', 'dateOfBirth'],
    weight: 0.25,
  },
  {
    name: 'Academic Information',
    fields: ['gpa', 'major', 'educationLevel', 'expectedGraduation', 'institution'],
    weight: 0.35,
  },
  {
    name: 'Skills & Interests',
    fields: ['skills', 'interests'],
    weight: 0.2,
  },
  {
    name: 'Achievements',
    fields: ['achievements'],
    weight: 0.2,
  },
]

export function useProfileCompletion(formData: Partial<ProfileFormData>) {
  const completion = useMemo(() => {
    const results = sections.map((section) => {
      const completedFields = section.fields.filter((field) => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], formData as any)
        if (Array.isArray(value)) {
          return value.length > 0
        }
        return !!value
      })

      const sectionScore = (completedFields.length / section.fields.length) * section.weight

      return {
        name: section.name,
        completed: completedFields.length,
        total: section.fields.length,
        percentage: Math.round((completedFields.length / section.fields.length) * 100),
        score: sectionScore,
      }
    })

    const totalScore = results.reduce((sum, section) => sum + section.score, 0)
    const overallPercentage = Math.round(totalScore * 100)

    return {
      sections: results,
      overall: overallPercentage,
    }
  }, [formData])

  return completion
} 