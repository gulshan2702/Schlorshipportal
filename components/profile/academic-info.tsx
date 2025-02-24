import { UseFormRegister, FormState } from 'react-hook-form'
import { ProfileFormData } from '@/app/(dashboard)/profile/page'

interface AcademicInfoProps {
  register: UseFormRegister<ProfileFormData>
  errors: FormState<ProfileFormData>['errors']
}

export function AcademicInfo({ register, errors }: AcademicInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          GPA
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="4"
          {...register('academic.gpa')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.academic?.gpa && (
          <p className="mt-1 text-sm text-red-600">
            {errors.academic.gpa.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Major
        </label>
        <input
          type="text"
          {...register('academic.major')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.academic?.major && (
          <p className="mt-1 text-sm text-red-600">
            {errors.academic.major.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Education Level
        </label>
        <select
          {...register('academic.educationLevel')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select education level</option>
          <option value="high_school">High School</option>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate</option>
          <option value="doctorate">Doctorate</option>
        </select>
        {errors.academic?.educationLevel && (
          <p className="mt-1 text-sm text-red-600">
            {errors.academic.educationLevel.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Expected Graduation
        </label>
        <input
          type="date"
          {...register('academic.expectedGraduation')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.academic?.expectedGraduation && (
          <p className="mt-1 text-sm text-red-600">
            {errors.academic.expectedGraduation.message}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Institution
        </label>
        <input
          type="text"
          {...register('academic.institution')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.academic?.institution && (
          <p className="mt-1 text-sm text-red-600">
            {errors.academic.institution.message}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">
          Academic Honors/Awards
        </label>
        <textarea
          {...register('academic.honors')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="List any academic honors or awards you've received"
        />
      </div>
    </div>
  )
} 