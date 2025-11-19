"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChartDataItem {
  date: string
  vehicles: number
  inventory: number
}

interface ChartAreaInteractiveProps {
  data: ChartDataItem[]
  loading?: boolean
}

const chartConfig = {
  vehicles: {
    label: "Sold-Out Vehicles",
    color: "hsl(142, 76%, 36%)",
  },
  inventory: {
    label: "Inventory Available",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ data, loading = false }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("30d")

  const filteredData = React.useMemo(() => {
    if (data.length === 0) return []
    
    const now = new Date()
    let daysToSubtract = 30
    if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "365d") {
      daysToSubtract = 365
    }
    
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    startDate.setHours(0, 0, 0, 0)
    
    return data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
  }, [data, timeRange])

  return (
    <Card className="pt-0 rounded-lg">
      <CardHeader className="flex items-center gap-2 space-y-0 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Total Sales</CardTitle>
          <CardDescription>
            Showing vehicle sales for the selected time period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 90 days
            </SelectItem>
            <SelectItem value="365d" className="rounded-lg">
              Last 365 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading || filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-gray-500">
            {loading ? "Loading chart data..." : "No sales data available for the selected period"}
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillVehicles" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-vehicles)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-vehicles)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillInventory" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-inventory)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-inventory)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="inventory"
                type="natural"
                fill="url(#fillInventory)"
                stroke="var(--color-inventory)"
                strokeWidth={2}
              />
              <Area
                dataKey="vehicles"
                type="natural"
                fill="url(#fillVehicles)"
                stroke="var(--color-vehicles)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
