import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PortfolioItem {
  symbol: string
  quantity: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  plPercentage: number
}

interface PortfolioChartProps {
  data: PortfolioItem[]
}

export default function PortfolioChart({ data }: PortfolioChartProps) {

  const chartData = data.map((item) => ({
    symbol: item.symbol,
    value: item.totalValue,
  }))

  return (
    <div className="chart-container">

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="symbol"/>
          <YAxis tickFormatter={(value) => (`$${(value / 1000).toFixed(0)}K`)} />
          <Tooltip formatter={(value: number) => [
            `$${value.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`,
            "Total Value"
          ]} />
          <Bar dataKey="value" fill="#0088FE" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

    </div>
  )
}

