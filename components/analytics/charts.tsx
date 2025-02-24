'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts'

interface ChartProps {
  data: any[]
  xKey: string
  yKey: string
  xLabel: string
  yLabel: string
}

export function LineChart({ data, xKey, yKey, xLabel, yLabel }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
        />
        <YAxis
          label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Line type="monotone" dataKey={yKey} stroke="#3B82F6" />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function BarChart({ data, xKey, yKey, xLabel, yLabel }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
        />
        <YAxis
          label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Bar dataKey={yKey} fill="#3B82F6" />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
} 