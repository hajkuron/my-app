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