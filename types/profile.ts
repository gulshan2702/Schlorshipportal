import { z } from 'zod'

export const profileSchema = z.object({
  personal: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  academic: z.object({
    gpa: z.string()
      .refine((val): val is string => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 4), {
        message: 'GPA must be between 0 and 4',
      }),
    major: z.string().min(1, 'Major is required'),
    educationLevel: z.string().min(1, 'Education level is required'),
    expectedGraduation: z.string().min(1, 'Expected graduation date is required'),
    institution: z.string().min(1, 'Institution is required'),
    honors: z.string().optional(),
    researchExperience: z.string().optional(),
    academicPublications: z.array(z.object({
      title: z.string(),
      journal: z.string(),
      year: z.string(),
      link: z.string().url().optional(),
    })).optional(),
  }),
  achievements: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    date: z.string().optional(),
  })).optional(),
  interests: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema> 