interface StatsCardProps {
  title: string
  value: string | number
  description: string
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {value}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  )
} 