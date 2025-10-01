"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface TreatmentChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export function TreatmentChart({ data }: TreatmentChartProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-900">Distribusi Tindakan</CardTitle>
        <CardDescription className="text-slate-600">Persentase setiap jenis perawatan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface RevenueChartProps {
  data: Array<{
    name: string
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-900">Analisis Pendapatan</CardTitle>
        <CardDescription className="text-slate-600">Pendapatan berdasarkan jenis tindakan</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`, 'Pendapatan']}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#0d9488" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}