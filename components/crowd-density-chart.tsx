"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for the chart
const data = [
  { time: "10:00", density: 120 },
  { time: "11:00", density: 180 },
  { time: "12:00", density: 250 },
  { time: "13:00", density: 310 },
  { time: "14:00", density: 290 },
  { time: "15:00", density: 320 },
  { time: "16:00", density: 280 },
]

export function CrowdDensityChart() {
  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, padding: "8px", borderRadius: "4px" }}
            formatter={(value) => [`${value} people`, "Density"]}
          />
          <Bar dataKey="density" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
