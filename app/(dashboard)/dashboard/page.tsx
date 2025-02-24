'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  DollarSign,
  ChevronRight,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { Card, LineChart, DonutChart, Title } from '@tremor/react'

interface DashboardData {
  totalApplications: number
  successRate: number
  pendingReview: number
  totalAmount: number
  applicationTrends: {
    month: string
    applications: number
  }[]
  categoryDistribution: {
    category: string
    percentage: number
  }[]
  recentActivity: {
    id: string
    user: {
      name: string
      avatar: string
    }
    action: string
    timestamp: string
  }[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalApplications: 1234,
    successRate: 78,
    pendingReview: 45,
    totalAmount: 125000,
    applicationTrends: [
      { month: 'Jan', applications: 150 },
      { month: 'Feb', applications: 220 },
      { month: 'Mar', applications: 215 },
      { month: 'Apr', applications: 210 },
      { month: 'May', applications: 140 },
      { month: 'Jun', applications: 150 },
    ],
    categoryDistribution: [
      { category: 'Merit-based', percentage: 35 },
      { category: 'Need-based', percentage: 25 },
      { category: 'Sports', percentage: 15 },
      { category: 'Research', percentage: 15 },
      { category: 'Arts', percentage: 10 },
    ],
    recentActivity: [
      {
        id: '1',
        user: {
          name: 'Sarah Johnson',
          avatar: '/avatars/sarah.jpg'
        },
        action: 'submitted a new application',
        timestamp: '2 hours ago'
      },
      {
        id: '2',
        user: {
          name: 'Michael Chen',
          avatar: '/avatars/michael.jpg'
        },
        action: 'updated his profile information',
        timestamp: '5 hours ago'
      }
    ]
  })

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/dashboard" className="flex items-center hover:text-gray-900">
          <Home className="w-4 h-4 mr-2" />
          Home
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span>Dashboard</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{data.totalApplications}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      +12% from last month
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{data.successRate}%</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      +5% from last month
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{data.pendingReview}</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      -8% from last month
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white overflow-hidden rounded-lg shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">${(data.totalAmount / 1000).toFixed(0)}K</div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      +15% from last month
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Application Trends */}
        <Card>
          <Title>Application Trends</Title>
          <LineChart
            className="mt-6 h-72"
            data={data.applicationTrends}
            index="month"
            categories={["applications"]}
            colors={["white"]}
            valueFormatter={(number) => number.toString()}
            yAxisWidth={40}
          />
        </Card>

        {/* Category Distribution */}
        <Card>
          <Title>Category Distribution</Title>
          <DonutChart
            className="mt-6 h-72"
            data={data.categoryDistribution}
            category="percentage"
            index="category"
            valueFormatter={(number) => `${number}%`}
            colors={["#FFFFFF", "#00FF00", "#FFBF00", "#FF007F", "#00FFFF"]}
          />
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-6 flow-root">
            <ul role="list" className="-mb-8">
              {data.recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== data.recentActivity.length - 1 ? (
                      <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <img
                          className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
                          src={activity.user.avatar}
                          alt=""
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{activity.user.name}</span>
                            {' '}
                            <span className="text-gray-500">{activity.action}</span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Available Scholarships */}
   
    </div>
  )
} 