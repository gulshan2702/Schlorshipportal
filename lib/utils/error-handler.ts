import { toast } from 'react-hot-toast'
import { ZodError } from 'zod'

interface ErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

export function handleError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(err.message)
    })
    return {
      message: 'Validation error',
      errors,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}

export function showErrorToast(error: unknown) {
  const { message, errors } = handleError(error)
  
  if (errors) {
    // Show first validation error
    const firstError = Object.values(errors)[0][0]
    toast.error(firstError)
  } else {
    toast.error(message)
  }
} 