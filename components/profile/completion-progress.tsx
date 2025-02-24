interface ProgressBarProps {
  percentage: number
  label: string
  color?: string
}

function ProgressBar({ percentage, label, color = 'blue' }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-600 transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface CompletionProgressProps {
  sections: {
    name: string
    completed: number
    total: number
    percentage: number
  }[]
  overall: number
}

export function CompletionProgress({ sections, overall }: CompletionProgressProps) {
  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
          <ProgressBar
            percentage={overall}
            label="Overall Progress"
            color={overall >= 80 ? 'green' : overall >= 40 ? 'blue' : 'red'}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Section Progress</h4>
          <div className="space-y-4">
            {sections.map((section) => (
              <ProgressBar
                key={section.name}
                percentage={section.percentage}
                label={`${section.name} (${section.completed}/${section.total})`}
              />
            ))}
          </div>
        </div>

        {overall < 100 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Suggestions to Complete Your Profile
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              {sections
                .filter((section) => section.percentage < 100)
                .map((section) => (
                  <li key={section.name}>
                    Complete {section.name.toLowerCase()} section (
                    {section.total - section.completed} items remaining)
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 