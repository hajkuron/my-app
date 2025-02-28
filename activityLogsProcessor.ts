'use client';

import activityLogsData from './data/activityLogs.json';

interface ActivityLog {
  id: number;
  date: string;
  app: string;
  total_duration: string;
  session_count: number;
  timeline: string;
  minutes: number;
}

interface ProcessedActivityData {
  app: string;
  minutes: number;
  percentage: number;
  category: string;
  categoryPercentage: number;
}

// Define app categories
const appCategories: { [key: string]: string } = {
  'Cursor': 'Productivity',
  'Terminal': 'Productivity',
  'Visual Studio Code': 'Productivity',
  'claude.ai': 'Productivity',
  'github.com': 'Productivity',
  'gitlab.com': 'Productivity',
  'stackoverflow.com': 'Productivity',
  'youtube_productive': 'Productivity',
  'localhost:5600': 'Productivity',

  // Communication
  'Messages': 'Communication',
  'Slack': 'Communication',
  'Discord': 'Communication',
  'FaceTime': 'Communication',
  'zoom.us': 'Communication',
  'gmail.com': 'Communication',
  'outlook.com': 'Communication',

  // Education
  'coursera.org': 'Education',
  'udemy.com': 'Education',
  'edx.org': 'Education',
  'wikipedia.org': 'Education',
  'medium.com': 'Education',
  'dev.to': 'Education',

  // Entertainment
  'youtube_entertainment': 'Entertainment',
  'netflix.com': 'Entertainment',
  'spotify.com': 'Entertainment',
  'twitch.tv': 'Entertainment',
  'reddit.com': 'Entertainment',
  'x.com': 'Entertainment',

  // Brain Rot
  'youtube_brain_rot': 'Brain Rot',

  // Shopping
  'amazon.com': 'Shopping',
  'ebay.com': 'Shopping',
  'vinted.nl': 'Shopping',
  'ray-ban.com': 'Shopping',
  'sunglassesid.com': 'Shopping',
  'sunglasshut.com': 'Shopping',
  'oliverpeoples.com': 'Shopping',

  // System
  'Finder': 'System',
  'System Settings': 'System',
  'loginwindow': 'System',
  'Screen Sharing': 'System',
  'UserNotificationCenter': 'System',
  'TextEdit': 'System',
  'Photos': 'System',
  'Numbers': 'System',
  'VLC': 'System'
};

// Default category for unknown apps
const DEFAULT_CATEGORY = 'Other';

// Helper function to get date range
function getDateRange(days: number): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of current day
  
  const startDate = new Date();
  if (days === 1) {
    // For daily view, get yesterday's data
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0); // Start of yesterday
    endDate.setDate(endDate.getDate() - 1); // End of yesterday
  } else {
    // For weekly view, get last N days including today
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0); // Start of the first day
  }
  
  return { startDate, endDate };
}

export function processActivityData(days: number = 1): ProcessedActivityData[] {
  // Cast the imported data to the correct type
  const activityLogs: ActivityLog[] = activityLogsData as ActivityLog[];

  // Get date range
  const { startDate, endDate } = getDateRange(days);

  // Filter logs for the date range
  const recentLogs = activityLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });

  // Group by app and sum minutes
  const appUsage = recentLogs.reduce<{ [key: string]: number }>((acc, log) => {
    acc[log.app] = (acc[log.app] || 0) + log.minutes;
    return acc;
  }, {});

  // Calculate category totals
  const categoryUsage = Object.entries(appUsage).reduce<{ [key: string]: number }>((acc, [app, minutes]) => {
    const category = appCategories[app] || DEFAULT_CATEGORY;
    acc[category] = (acc[category] || 0) + minutes;
    return acc;
  }, {});

  // Calculate total minutes for percentages
  const totalMinutes = Object.values(appUsage).reduce((sum, minutes) => sum + minutes, 0);

  // Process data with categories and percentages
  const processedData = Object.entries(appUsage)
    .map(([app, minutes]) => {
      const category = appCategories[app] || DEFAULT_CATEGORY;
      const categoryMinutes = categoryUsage[category];
      return {
        app,
        minutes,
        percentage: (minutes / totalMinutes) * 100,
        category,
        categoryPercentage: (categoryMinutes / totalMinutes) * 100
      };
    })
    .sort((a, b) => b.minutes - a.minutes) // Sort by minutes in descending order
    .slice(0, 10); // Take only top 10 apps

  return processedData;
}

// For backward compatibility
export function processLastDayActivityData(): ProcessedActivityData[] {
  return processActivityData(1);
}

// For weekly data
export function processLastWeekActivityData(): ProcessedActivityData[] {
  return processActivityData(7);
}

// Helper function to format duration in hours and minutes
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
}

// New interface for timeline entry
interface TimelineEntry {
  timestamp: string;
  duration: string;
  during_afk: boolean;
}

export interface GanttChartData {
  app: string;
  startTime: string;
  endTime: string;
  category: string;
}

export function processActivityLogsForGantt(days: number = 1): GanttChartData[] {
  // Cast the imported data to the correct type
  const activityLogs: ActivityLog[] = activityLogsData as ActivityLog[];
  console.log('Processing activity logs, total entries:', activityLogs.length);

  // Get date range
  const { startDate, endDate } = getDateRange(days);
  console.log('Date range:', { startDate, endDate });

  // Filter logs for the date range
  const recentLogs = activityLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });
  console.log('Filtered logs for date range:', recentLogs.length);

  // Process each log entry
  const ganttData: GanttChartData[] = [];

  recentLogs.forEach(log => {
    try {
      // Log the raw timeline string for debugging
      console.log(`Raw timeline for ${log.app}:`, log.timeline);

      // First, clean up the string to remove array brackets
      const cleanTimeline = log.timeline.slice(1, -1);
      console.log(`Cleaned timeline for ${log.app}:`, cleanTimeline);

      // Extract timeline entries using regex - updated pattern to handle milliseconds
      const timelineRegex = /'timestamp': Timestamp\('([^']+\+\d{4})'(?:, tz='UTC')?\), 'duration': Timedelta\('(\d+) days (\d{2}):(\d{2}):(\d{2})(?:\.\d+)?'\)/g;
      let match;
      let entriesCount = 0;
      
      while ((match = timelineRegex.exec(cleanTimeline)) !== null) {
        entriesCount++;
        const [fullMatch, timestamp, days, hours, minutes, seconds] = match;
        console.log(`Matched entry for ${log.app}:`, { timestamp, days, hours, minutes, seconds });
        
        // Skip very short sessions (less than 30 seconds)
        const totalSeconds = 
          parseInt(days) * 24 * 60 * 60 + 
          parseInt(hours) * 60 * 60 + 
          parseInt(minutes) * 60 + 
          parseInt(seconds);
        
        if (totalSeconds < 30) {
          console.log(`Skipping short session for ${log.app}: ${hours}h ${minutes}m ${seconds}s`);
          continue;
        }

        // Create start time
        const startTime = new Date(timestamp);
        
        // Calculate end time by adding duration
        const endTime = new Date(startTime);
        endTime.setSeconds(endTime.getSeconds() + totalSeconds);

        ganttData.push({
          app: log.app,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          category: appCategories[log.app] || DEFAULT_CATEGORY
        });
      }
      
      if (entriesCount === 0) {
        console.log(`No matches found in timeline for ${log.app}. Timeline string:`, cleanTimeline);
      } else {
        console.log(`Processing timeline for ${log.app}, entries:`, entriesCount);
      }
    } catch (error) {
      console.error(`Error processing timeline for app ${log.app}:`, error);
      console.error('Timeline string:', log.timeline);
    }
  });

  console.log('Final Gantt data entries:', ganttData.length);
  return ganttData;
} 