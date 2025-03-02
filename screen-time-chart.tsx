"use client"

import { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import { Clock, Laptop } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons"
import { processActivityData, formatDuration } from "./activityLogsProcessor"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Category colors
const categoryColors: { [key: string]: string } = {
  "Productivity": "#22C55E", // green-500
  "Communication": "#A855F7", // purple-500
  "Education": "#3B82F6", // blue-500
  "Entertainment": "#EF4444", // red-500
  "Shopping": "#F97316", // orange-500
  "System": "#6B7280", // gray-500
  "Brain Rot": "#DC2626", // red-600 (darker red for emphasis)
  "Other": "#94A3B8", // slate-400
};

// Prepare data for the pie chart
const getPieData = (data: ReturnType<typeof processActivityData>, selectedCategory?: string) => {
  if (!data.length) return [];

  // Group data by category
  const categoryGroups = data.reduce<{ [key: string]: typeof data }>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (selectedCategory) {
    const categoryApps = categoryGroups[selectedCategory] || [];
    return categoryApps.map((app, index) => ({
      name: app.app,
      time: app.minutes,
      color: adjustColor(categoryColors[selectedCategory] || categoryColors.Other, index),
    }));
  }

  return Object.entries(categoryGroups).map(([category, apps]) => ({
    name: category,
    time: apps.reduce((sum, app) => sum + app.minutes, 0),
    color: categoryColors[category] || categoryColors.Other,
  }));
};

const adjustColor = (baseColor: string, index: number) => {
  // Convert hex to HSL for better color manipulation
  const hex = baseColor.replace("#", "")
  const r = Number.parseInt(hex.slice(0, 2), 16) / 255
  const g = Number.parseInt(hex.slice(2, 4), 16) / 255
  const b = Number.parseInt(hex.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else if (max === b) h = (r - g) / d + 4

    h /= 6
  }

  // Create more distinct shades by adjusting both lightness and saturation
  const newL = Math.max(0.3, Math.min(0.7, l + (index * 0.2 - 0.3)))
  const newS = Math.max(0.4, Math.min(0.9, s + index * 0.1))

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = newL < 0.5 ? newL * (1 + newS) : newL + newS - newL * newS
  const p = 2 * newL - q

  const newR = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
  const newG = Math.round(hue2rgb(p, q, h) * 255)
  const newB = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)

  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
}

// Custom active shape for the donut chart
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props

  return (
    <g>
      <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="currentColor" className="text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="currentColor" className="text-xs">
        {formatDuration(payload.time)} ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export default function ScreenTimeChart() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedCategory, setExpandedCategory] = useState<string | undefined>()
  const [isWeeklyView, setIsWeeklyView] = useState(false)
  const [showAllApps, setShowAllApps] = useState(true)
  
  // Get the processed activity data based on the view
  const activityData = processActivityData(isWeeklyView ? 7 : 1)
  
  // Filter apps with less than 5 minutes of usage
  const filteredActivityData = activityData.filter(item => item.minutes >= 5);
  
  const pieData = getPieData(
    showAllApps ? filteredActivityData : filteredActivityData.slice(0, 10),
    expandedCategory
  );

  // Calculate total screen time using all data (including < 5 min apps)
  const totalScreenTime = activityData.reduce((acc, item) => acc + item.minutes, 0)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory((prev) => (prev === categoryName ? undefined : categoryName))
    setActiveIndex(0) // Reset active index when switching views
  }

  // Group filtered data by category for the list
  const categoryGroups = filteredActivityData.reduce<{ [key: string]: typeof filteredActivityData }>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Calculate category totals including all data
  const categoryTotals = activityData.reduce<{ [key: string]: number }>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.minutes;
    return acc;
  }, {});

  // Sort categories by total time
  const sortedCategories = Object.entries(categoryGroups)
    .sort(([catA, _], [catB, __]) => (categoryTotals[catB] || 0) - (categoryTotals[catA] || 0));

  return (
    <Card className="w-full p-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold">Screen Time</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center min-w-[200px]">
            <div className="flex items-center gap-2">
              <Switch
                id="view-mode"
                checked={isWeeklyView}
                onCheckedChange={setIsWeeklyView}
              />
              <Label htmlFor="view-mode" className="min-w-[100px]">
                {isWeeklyView ? "Last 7 Days" : "Yesterday"}
              </Label>
            </div>
            <div className="flex items-center text-muted-foreground ml-4">
              <Clock className="mr-1 h-5 w-5" />
              <span className="min-w-[50px]">{isWeeklyView ? "Weekly" : "Daily"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="show-all"
              checked={showAllApps}
              onCheckedChange={setShowAllApps}
            />
            <Label htmlFor="show-all">
              {showAllApps ? "Show All (≥5m)" : "Top 10 (≥5m)"}
            </Label>
          </div>
        </div>
      </div>

      <div className="flex items-center text-muted-foreground mb-4">
        <Laptop className="mr-1 h-5 w-5" />
        <span className="text-lg">
          {isWeeklyView ? "Weekly" : "Daily"} Total: {formatDuration(totalScreenTime)}
        </span>
      </div>

      <CardContent className="p-0">
        <div className="flex h-fit">
          {/* Categories and apps list */}
          <div className="w-1/2 pr-4 border-r max-h-[500px] overflow-y-auto">
            {sortedCategories.map(([category, apps], index) => {
              const categoryTime = categoryTotals[category] || 0;
              const isExpanded = expandedCategory === category;

              return (
                <div key={category} className="border-b border-border/5 last:border-none">
                  <div
                    className="flex items-center gap-2 cursor-pointer h-8"
                    onMouseEnter={() => !isExpanded && setActiveIndex(index)}
                    onClick={() => toggleCategory(category)}
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: categoryColors[category] || categoryColors.Other,
                      }}
                    />
                    <div className="flex flex-1 items-center">
                      <span className="font-medium flex-1">{category}</span>
                      <span className="text-muted-foreground ml-4">{formatDuration(categoryTime)}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-8 overflow-hidden transition-all">
                      {apps.map((app, appIndex) => {
                        const appColor = adjustColor(categoryColors[category] || categoryColors.Other, appIndex);
                        return (
                          <div key={app.app} className="flex items-center h-8">
                            <div className="flex items-center gap-2 flex-1">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: appColor }} 
                              />
                              <span className="text-muted-foreground text-sm flex-1">{app.app}</span>
                              <span className="text-muted-foreground text-sm ml-4">{formatDuration(app.minutes)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pie Chart */}
          <div className="w-1/2 pl-4">
            <div className="w-full h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="90%"
                    dataKey="time"
                    onMouseEnter={onPieEnter}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

