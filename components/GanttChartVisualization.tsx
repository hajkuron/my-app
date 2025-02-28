"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react"
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

// Update categoryPalettes to have a main color for the category
const categoryPalettes: Record<string, { main: string; shades: string[] }> = {
  Productivity: {
    main: "#22c55e",
    shades: ["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"]
  },
  Entertainment: {
    main: "#14b8a6",
    shades: ["#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a"]
  },
  "Brain Rot": {
    main: "#ef4444",
    shades: ["#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"]
  },
  Communication: {
    main: "#3b82f6",
    shades: ["#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"]
  },
  Education: {
    main: "#a855f7",
    shades: ["#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87"]
  },
  Shopping: {
    main: "#f97316",
    shades: ["#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"]
  },
  System: {
    main: "#64748b",
    shades: ["#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a"]
  },
  Other: {
    main: "#78716c",
    shades: ["#a8a29e", "#78716c", "#57534e", "#44403c", "#292524", "#1c1917"]
  },
}

// Process data for Gantt chart
const processGanttData = (data: GanttChartData[]) => {
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
  return processed;
}

// New function to merge overlapping time blocks
const mergeTimeBlocks = (blocks: any[]) => {
  if (blocks.length === 0) return [];
  
  // Sort blocks by start hour
  const sortedBlocks = [...blocks].sort((a, b) => a.startHour - b.startHour);
  const merged = [sortedBlocks[0]];
  
  for (let i = 1; i < sortedBlocks.length; i++) {
    const current = sortedBlocks[i];
    const last = merged[merged.length - 1];
    
    if (current.startHour <= last.endHour) {
      // Blocks overlap, merge them
      last.endHour = Math.max(last.endHour, current.endHour);
      last.duration = (last.endHour - last.startHour + 24) % 24;
      last.endTimeFormatted = current.endTimeFormatted;
      last.durationFormatted = `${Math.floor(last.duration)}h ${Math.round((last.duration % 1) * 60)}m`;
    } else {
      // No overlap, add as new block
      merged.push(current);
    }
  }
  
  return merged;
}

// Update the interface to accept Date
interface ScreenTimeData {
  app: string
  startTime: string
  endTime: string
  category: string
}

interface GanttChartVisualizationProps {
  data: ScreenTimeData[]
}

export default function GanttChartVisualization() {
  // Use a Date object for better date manipulation
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [days] = useState(1); // Keep this for potential future use with weekly view
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Format the date for display
  const formattedDate = format(selectedDate, "MMM d, yyyy");

  // Process data for the selected date
  const data = processActivityLogsForGantt(selectedDate);
  const ganttData = processGanttData(data);

  // Handle date navigation
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Get unique categories and their apps
  const categories = Array.from(new Set(data.map((item) => item.category)));
  const categoryApps = categories.reduce<Record<string, string[]>>((acc, category) => {
    acc[category] = Array.from(new Set(data.filter(item => item.category === category).map(item => item.app)))
    return acc
  }, {});

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }

  // Assign colors to apps within their category
  const appColors = Object.entries(categoryApps).reduce<Record<string, string>>((acc, [category, apps]) => {
    const palette = categoryPalettes[category]?.shades || categoryPalettes.Other.shades;
    apps.forEach((app, index) => {
      acc[app] = palette[index % palette.length];
    });
    return acc;
  }, {});

  // Calculate day start and end times (for the timeline)
  const dayStart = 5 // 5 AM
  const dayEnd = 29 // 5 AM next day
  const totalHours = dayEnd - dayStart

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Screen Time Gantt Chart</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{formattedDate}</span>
            <Button variant="outline" size="icon" onClick={handleNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>Visualizing app usage by category throughout the day</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[220px_1fr] h-full" style={{ minHeight: '300px' }}>
          {/* Left column - Categories and apps */}
          <div className="border-r p-4 h-full overflow-y-auto">
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center w-full text-left mb-1 hover:bg-gray-100 rounded px-2 py-1 pr-4"
                >
                  <div className="flex items-center justify-center w-6 h-6 mr-2">
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full mr-2 flex-shrink-0" 
                    style={{ backgroundColor: categoryPalettes[category]?.main || categoryPalettes.Other.main }}
                  />
                  <h3 className="text-base font-semibold">{category}</h3>
                </button>
                {expandedCategories.has(category) && (
                  <div className="pl-12 pr-4 text-sm text-gray-600">
                    {categoryApps[category].map(app => (
                      <div key={app} className="flex items-center mb-1 py-0.5">
                        <div 
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                          style={{ backgroundColor: appColors[app] }}
                        />
                        <span className="truncate pr-2">{app}</span>
                      </div>
                    ))}
                  </div>
                )}
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

            {/* Timeline grid */}
            <div className="relative mt-2 flex-grow">
              {/* Vertical hour lines */}
              {Array.from({ length: totalHours + 1 }).map((_, i) => (
                <div
                  key={`vline-${i}`}
                  className="absolute h-full w-px bg-gray-200"
                  style={{ left: `${(i / totalHours) * 100}%` }}
                />
              ))}

              {/* Category rows */}
              {categories.map((category, categoryIndex) => {
                const categoryData = ganttData.filter(item => item.category === category);
                const rowHeight = 100 / categories.length;
                
                if (!expandedCategories.has(category)) {
                  // Merge all apps in the category when collapsed
                  const mergedBlocks = mergeTimeBlocks(categoryData);
                  return (
                    <div
                      key={category}
                      className="relative border-b border-gray-200"
                      style={{ height: `${rowHeight}%` }}
                    >
                      {mergedBlocks.map((block, blockIndex) => (
                        <TooltipProvider key={blockIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute rounded-md flex items-center justify-center text-xs font-medium text-white overflow-hidden border border-white/20"
                                style={{
                                  left: `${((block.startHour - dayStart) / totalHours) * 100}%`,
                                  width: `${(block.duration / totalHours) * 100}%`,
                                  backgroundColor: categoryPalettes[category]?.main || categoryPalettes.Other.main,
                                  height: '70%',
                                  top: '15%'
                                }}
                              >
                                {block.duration > 0.5 ? category : ""}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">{category}</p>
                                <p className="text-xs">
                                  {block.startTimeFormatted} - {block.endTimeFormatted}
                                </p>
                                <p className="text-xs">{block.durationFormatted}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  );
                }

                // Show individual apps when expanded
                const apps = categoryApps[category];
                const appHeight = rowHeight / apps.length;
                
                return (
                  <div
                    key={category}
                    className="relative border-b border-gray-200"
                    style={{ height: `${rowHeight}%` }}
                  >
                    {apps.map((app, appIndex) => {
                      const appData = categoryData.filter(item => item.app === app);
                      return (
                        <div
                          key={app}
                          className="relative"
                          style={{ height: `${100 / apps.length}%` }}
                        >
                          {appData.map((block, blockIndex) => (
                            <TooltipProvider key={blockIndex}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute rounded-md flex items-center justify-center text-xs font-medium text-white overflow-hidden border border-white/20"
                                    style={{
                                      left: `${((block.startHour - dayStart) / totalHours) * 100}%`,
                                      width: `${(block.duration / totalHours) * 100}%`,
                                      backgroundColor: appColors[app],
                                      height: '70%',
                                      top: '15%'
                                    }}
                                  >
                                    {block.duration > 0.5 ? app : ""}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1">
                                    <p className="font-medium">{app}</p>
                                    <p className="text-xs">{category}</p>
                                    <p className="text-xs">
                                      {block.startTimeFormatted} - {block.endTimeFormatted}
                                    </p>
                                    <p className="text-xs">{block.durationFormatted}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}