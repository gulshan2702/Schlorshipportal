interface CompletionIndicatorProps {
  percentage: number
}

export function CompletionIndicator({ percentage }: CompletionIndicatorProps) {
  return (
    <div className="ml-2 flex items-center">
      <div className="w-2 h-2 rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            percentage >= 80
              ? 'bg-green-500'
              : percentage >= 40
              ? 'bg-blue-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="ml-1 text-xs text-gray-500">{percentage}%</span>
    </div>
  )
} 