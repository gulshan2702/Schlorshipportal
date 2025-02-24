import { useFieldArray, UseFormRegister } from 'react-hook-form'

interface AchievementFieldProps {
  register: UseFormRegister<any>
  control: any
  errors: any
}

export function AchievementField({ register, control, errors }: AchievementFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'achievements',
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start space-x-4">
          <div className="flex-grow space-y-4">
            <div>
              <input
                type="text"
                {...register(`achievements.${index}.title`)}
                placeholder="Achievement title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.achievements?.[index]?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.achievements[index].title.message}
                </p>
              )}
            </div>
            <div>
              <textarea
                {...register(`achievements.${index}.description`)}
                placeholder="Description"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="date"
                {...register(`achievements.${index}.date`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(index)}
            className="mt-1 text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ title: '', description: '', date: '' })}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Achievement
      </button>
    </div>
  )
} 