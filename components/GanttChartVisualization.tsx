"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { processActivityLogsForGantt, GanttChartData } from "../activityLogsProcessor"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Process data for Gantt chart
const processGanttData = (data: GanttChartData[]) => {
  console.log('Processing Gantt data, input:', data);
  const processed = data.map((item) => {
    const startTime = parseISO(item.startTime)
    const endTime = parseISO(item.endTime)
    const startHour = startTime.getHours() + startTime.getMinutes() / 60
    const endHour = endTime.getHours() + endTime.getMinutes() / 60
    const duration = (endHour - startHour + 24) % 24

    return {
      ...item,
      startHour,
      endHour,
      duration,
      startTimeFormatted: format(startTime, "h:mm a"),
      endTimeFormatted: format(endTime, "h:mm a"),
      durationFormatted: `${Math.floor(duration)}h ${Math.round((duration % 1) * 60)}m`,
    }
  })
  console.log('Processed Gantt data:', processed);
  return processed;
}

export interface ScreenTimeData {
  app: string
  startTime: string
  endTime: string
  category: string
}

interface GanttChartVisualizationProps {
  data: ScreenTimeData[]
}

export default function GanttChartVisualization() {
  const [days, setDays] = useState(1)
  const [date, setDate] = useState(format(new Date(), "MMM d, yyyy"))
  const data = processActivityLogsForGantt(days)
  console.log('Raw activity data:', data);
  const ganttData = processGanttData(data)

  // Get unique apps and categories
  const uniqueApps = Array.from(new Set(data.map((item) => item.app)))
  const categories = Array.from(new Set(data.map((item) => item.category)))
  console.log('Categories found:', categories);

  // Update categoryPalettes to include all categories from our activity processor
  const categoryPalettes: Record<string, string[]> = {
    Productivity: ["#4ade80", "#22c55e", "#16a34a", "#15803d"],
    Entertainment: ["#2dd4bf", "#14b8a6", "#0d9488", "#0f766e"],
    "Brain Rot": ["#f87171", "#ef4444", "#dc2626", "#b91c1c"],
    Communication: ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8"],
    Education: ["#c084fc", "#a855f7", "#9333ea", "#7e22ce"],
    Shopping: ["#fb923c", "#f97316", "#ea580c", "#c2410c"],
    System: ["#94a3b8", "#64748b", "#475569", "#334155"],
    Other: ["#a8a29e", "#78716c", "#57534e", "#44403c"],
  }

  // Assign colors to apps within their category
  const appColors = uniqueApps.reduce<Record<string, string>>((acc, app) => {
    const category = data.find((item) => item.app === app)?.category || ""
    const palette = categoryPalettes[category] || categoryPalettes.Other
    acc[app] = palette[Math.floor(Math.random() * palette.length)]
    return acc
  }, {})

  // Calculate day start and end times (for the timeline)
  const dayStart = 5 // 5 AM
  const dayEnd = 29 // 5 AM next day
  const totalHours = dayEnd - dayStart

  // Get unique categories and their apps
  const categoryApps = categories.reduce<Record<string, string[]>>((acc, category) => {
    acc[category] = Array.from(new Set(data.filter(item => item.category === category).map(item => item.app)))
    return acc
  }, {})

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Screen Time Gantt Chart</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{date}</span>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Visualizing app usage by category throughout the day</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[200px_1fr] h-full" style={{ minHeight: '300px' }}>
          {/* Left column - Categories and apps */}
          <div className="border-r p-4 h-full">
            {categories.map((category) => (
              <div key={category} className="mb-2">
                <div className="flex items-center mb-1">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ 
                      backgroundColor: categoryPalettes[category as keyof typeof categoryPalettes]?.[0] || '#888'
                    }}
                  />
                  <h3 className="text-base font-semibold">{category}</h3>
                </div>
                <div className="pl-5 text-sm text-gray-600">
                  {categoryApps[category].map(app => (
                    <div key={app} className="flex items-center mb-1">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: appColors[app] }}
                      />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right column - Timeline */}
          <div className="p-4 overflow-x-auto h-full" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Time axis */}
            <div className="flex border-b pb-1 flex-shrink-0">
              {Array.from({ length: totalHours + 1 }).map((_, i) => {
                const hour = (dayStart + i) % 24
                return (
                  <div key={i} className="flex-1 text-xs text-center font-medium">
                    {hour}:00
                  </div>
                )
              })}
            </div>

            {/* Timeline grid with vertical lines */}
            <div className="relative mt-2 flex-grow" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Create a container with fixed height */}
              <div className="relative" style={{ height: '100%', minHeight: '300px' }}>
                {/* Vertical hour lines for the entire grid */}
                {Array.from({ length: totalHours + 1 }).map((_, i) => (
                  <div 
                    key={`vline-${i}`}
                    className="absolute h-full w-px bg-gray-200"
                    style={{ 
                      left: `${(i / totalHours) * 100}%`,
                      top: 0,
                      bottom: 0
                    }}
                  />
                ))}
  
                {/* Category rows */}
                {categories.map((category, categoryIndex) => {
                  const categoryApps = ganttData.filter((item) => item.category === category)
                  const rowHeight = 100 / categories.length // Distribute height evenly
                  
                  return (
                    <div 
                      key={category} 
                      className="relative border-b border-gray-200"
                      style={{
                        height: `${rowHeight}%`,
                      }}
                    >
                      {/* App blocks */}
                      {categoryApps.map((item, index) => {
                        const startPercent = (((item.startHour - dayStart + 24) % 24) / totalHours) * 100
                        const widthPercent = (item.duration / totalHours) * 100

                        return (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute rounded-md flex items-center justify-center text-xs font-medium text-white overflow-hidden border border-white/20"
                                  style={{
                                    left: `${startPercent}%`,
                                    width: `${widthPercent}%`,
                                    backgroundColor: appColors[item.app],
                                    height: '70%',
                                    top: '15%'
                                  }}
                                >
                                  {widthPercent > 5 ? item.app : ""}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <p className="font-medium">{item.app}</p>
                                  <p className="text-xs">{item.category}</p>
                                  <p className="text-xs">
                                    {item.startTimeFormatted} - {item.endTimeFormatted}
                                  </p>
                                  <p className="text-xs">{item.durationFormatted}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}