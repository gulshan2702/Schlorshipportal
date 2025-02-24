import { z } from 'zod'

// Custom validation functions
const isValidPhoneNumber = (value: string) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/
  return phoneRegex.test(value)
}

const isValidURL = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const profileSchema = z.object({
  personal: z.object({
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name cannot exceed 50 characters'),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name cannot exceed 50 characters'),
    dateOfBirth: z.string()
      .min(1, 'Date of birth is required')
      .refine((date) => new Date(date) <= new Date(), {
        message: 'Date of birth cannot be in the future',
      }),
    gender: z.string().optional(),
    phoneNumber: z.string()
      .optional()
      .refine((val) => !val || isValidPhoneNumber(val), {
        message: 'Invalid phone number format',
      }),
  }),
  academic: z.object({
    gpa: z.string()
      .refine((val): val is string => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 4), {
        message: 'GPA must be between 0 and 4',
      }),
    major: z.string()
      .min(1, 'Major is required')
      .max(100, 'Major name is too long'),
    educationLevel: z.enum(['high_school', 'undergraduate', 'graduate', 'doctorate'], {
      errorMap: () => ({ message: 'Please select a valid education level' }),
    }),
    expectedGraduation: z.string()
      .min(1, 'Expected graduation date is required')
      .refine((date) => new Date(date) > new Date(), {
        message: 'Expected graduation date must be in the future',
      }),
    institution: z.string()
      .min(1, 'Institution is required')
      .max(100, 'Institution name is too long'),
    honors: z.string().optional(),
    researchExperience: z.string()
      .max(1000, 'Description is too long')
      .optional(),
    academicPublications: z.array(
      z.object({
        title: z.string().min(1, 'Publication title is required'),
        journal: z.string().min(1, 'Journal name is required'),
        year: z.string()
          .refine((val) => !val || /^\d{4}$/.test(val), {
            message: 'Invalid year format',
          }),
        link: z.string()
          .optional()
          .refine((val) => !val || isValidURL(val), {
            message: 'Invalid URL format',
          }),
      })
    ).optional(),
  }),
  achievements: z.array(
    z.object({
      title: z.string()
        .min(1, 'Achievement title is required')
        .max(200, 'Title is too long'),
      description: z.string()
        .optional()
        .refine((val) => !val || val.length <= 1000, {
          message: 'Description is too long',
        }),
      date: z.string().optional(),
    })
  ).optional(),
  interests: z.array(z.string()
    .min(1, 'Interest cannot be empty')
    .max(50, 'Interest is too long')
  ).optional(),
  skills: z.array(z.string()
    .min(1, 'Skill cannot be empty')
    .max(50, 'Skill is too long')
  ).optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema> 