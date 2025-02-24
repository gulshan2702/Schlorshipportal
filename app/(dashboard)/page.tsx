export default function Dashboard() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-blue-900">Matched Scholarships</h2>
          <p className="mt-2 text-3xl font-semibold text-blue-900">0</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-green-900">Applications Submitted</h2>
          <p className="mt-2 text-3xl font-semibold text-green-900">0</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-lg font-medium text-purple-900">Profile Completion</h2>
          <p className="mt-2 text-3xl font-semibold text-purple-900">0%</p>
        </div>
      </div>
    </div>
  )
} 