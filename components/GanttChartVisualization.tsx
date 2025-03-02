"use client"

import { useState, useRef } from "react"
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

interface ProcessedGanttData extends GanttChartData {
  startHour: number;
  endHour: number;
  duration: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
  durationFormatted: string;
}

// New function to merge overlapping time blocks
const mergeTimeBlocks = (blocks: ProcessedGanttData[]) => {
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

interface _GanttChartVisualizationProps {
  data: ScreenTimeData[]
}

export default function GanttChartVisualization() {
  // Set default date to yesterday
  const [selectedDate, _setDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });
  const [_days, _setDays] = useState(1); // Keep this for potential future use with weekly view
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Add zoom state
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, > 1 = zoomed in
  const maxZoom = 4; // Maximum zoom level
  const minZoom = 0.5; // Minimum zoom level

  // Add drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Handle drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!timelineRef.current || zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart(e.pageX - timelineRef.current.offsetLeft);
    setScrollLeft(timelineRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    e.preventDefault();
    const x = e.pageX - timelineRef.current.offsetLeft;
    const walk = (x - dragStart) * 1.5;
    timelineRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Format the date for display
  const formattedDate = format(selectedDate, "MMM d, yyyy");

  // Process data for the selected date
  const data = processActivityLogsForGantt(selectedDate);
  const ganttData = processGanttData(data);

  // Handle date navigation
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    _setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    _setDate(newDate);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, minZoom));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  // Get unique categories and their apps
  const categories = Array.from(new Set(data.map((item) => item.category)));
  
  // Calculate total duration for each category for sorting
  const categoryDurations = categories.reduce<Record<string, number>>((acc, category) => {
    acc[category] = data
      .filter(item => item.category === category)
      .reduce((sum, item) => {
        const startTime = parseISO(item.startTime);
        const endTime = parseISO(item.endTime);
        return sum + ((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // Convert to minutes
      }, 0);
    return acc;
  }, {});

  // Sort categories by total duration in descending order
  const sortedCategories = categories.sort((a, b) => categoryDurations[b] - categoryDurations[a]);

  const categoryApps = sortedCategories.reduce<Record<string, string[]>>((acc, category) => {
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
  const calculateTimeRange = (data: ProcessedGanttData[]) => {
    if (data.length === 0) {
      // Default range from 6 AM to 1 AM next day
      return { dayStart: 6, dayEnd: 25 };
    }

    // Find earliest start and latest end, handling day wrapping
    const timePoints = data.map(item => ({
      hour: item.startHour,
      // If hour is less than 6, it's after midnight
      adjustedHour: item.startHour < 6 ? item.startHour + 24 : item.startHour
    })).concat(data.map(item => ({
      hour: item.endHour,
      // If hour is less than 6, it's after midnight
      adjustedHour: item.endHour < 6 ? item.endHour + 24 : item.endHour
    })));

    // Sort by adjusted hours to find true earliest and latest
    timePoints.sort((a, b) => a.adjustedHour - b.adjustedHour);
    
    // Get the earliest and latest actual hours
    let earliestHour = timePoints[0].hour;
    let latestHour = timePoints[timePoints.length - 1].hour;

    // If earliest hour is after 6 AM, we can add the buffer
    earliestHour = earliestHour >= 6 ? Math.max(6, Math.floor(earliestHour) - 1) : 6;
    
    // If latest hour is before 6 AM, it's actually late night
    if (latestHour < 6) {
      latestHour += 24;
    }
    // Cap the end time at 1 AM (25 hours)
    latestHour = Math.min(25, Math.ceil(latestHour) + 1);

    return {
      dayStart: earliestHour,
      dayEnd: latestHour
    };
  };

  const { dayStart, dayEnd } = calculateTimeRange(ganttData);
  const totalHours = dayEnd - dayStart;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Screen Time Gantt Chart</CardTitle>
          <div className="flex items-center gap-4">
            {/* Date controls */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{formattedDate}</span>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Zoom controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= minZoom}
              >
                -
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                disabled={zoomLevel === 1}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= maxZoom}
              >
                +
              </Button>
            </div>
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

          {/* Right column - Timeline with zoom */}
          <div 
            ref={timelineRef}
            className="p-4 overflow-x-auto h-full cursor-grab active:cursor-grabbing" 
            style={{ display: 'flex', flexDirection: 'column' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {/* Time axis */}
            <div className="flex border-b pb-1 flex-shrink-0" style={{ width: `${100 * zoomLevel}%`, minWidth: '100%' }}>
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
            <div className="relative mt-2 flex-grow" style={{ width: `${100 * zoomLevel}%`, minWidth: '100%' }}>
              {/* Vertical hour lines */}
              {Array.from({ length: totalHours + 1 }).map((_, i) => (
                <div
                  key={`vline-${i}`}
                  className="absolute h-full w-px bg-gray-200"
                  style={{ left: `${(i / totalHours) * 100}%` }}
                />
              ))}

              {/* Category rows */}
              {categories.map((category, _categoryIndex) => {
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
                const _appHeight = rowHeight / apps.length;
                
                return (
                  <div
                    key={category}
                    className="relative border-b border-gray-200"
                    style={{ height: `${rowHeight}%` }}
                  >
                    {apps.map((app, _appIndex) => {
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