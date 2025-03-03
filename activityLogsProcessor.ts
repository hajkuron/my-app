'use client';

import activityLogsData from './data/activityLogs.json';
import { formatInTimeZone } from 'date-fns-tz';

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
  // Productivity
  'Cursor': 'Productivity',
  'Terminal': 'Productivity',
  'Visual Studio Code': 'Productivity',
  'claude.ai': 'Productivity',
  'github.com': 'Productivity',
  'gitlab.com': 'Productivity',
  'stackoverflow.com': 'Productivity',
  'youtube_productive': 'Productivity',
  'localhost:5600': 'Productivity',
  'localhost:3000': 'Productivity',
  'vercel.com': 'Productivity',
  'v0.dev': 'Productivity',
  'platform.openai.com': 'Productivity',
  'supabase.com': 'Productivity',
  'ui.shadcn.com': 'Productivity',
  'chatgpt.com': 'Productivity',
  'ChatGPT': 'Productivity',
  'AppCleaner': 'Productivity',
  'Folx': 'Productivity',
  'Passwords': 'Productivity',
  'Microsoft Authenticator': 'Productivity',
  'Authentication': 'Productivity',
  'Chrome': 'Productivity',
  'DuckDuckGo': 'Productivity',
  'notion.so': 'Productivity',
  'my-app-rose-two.vercel.app': 'Productivity',
  'canva.com': 'Productivity',
  'canvas.vu.nl': 'Productivity',
  'eu2.make.com': 'Productivity',
  'docs.google.com': 'Productivity',
  'notion.id': 'Productivity',

  // Travel
  'myvanportugal.com': 'Travel',
  'rent-help.roadsurfer.com': 'Travel',
  'booking.roadsurfer.com': 'Travel',
  'yescapa.com': 'Travel',
  'siestacampers.com': 'Travel',
  'howcampers.com': 'Travel',
  'indiecampers.com': 'Travel',
  'zestcarrental.com': 'Travel',
  'AutoScout24': 'Travel',

  // Entertainment
  'youtube_entertainment': 'Entertainment',
  'netflix.com': 'Entertainment',
  'spotify.com': 'Entertainment',
  'twitch.tv': 'Entertainment',
  'reddit.com': 'Entertainment',
  'x.com': 'Entertainment',
  '127.0.0.1:32400': 'Entertainment',
  'plex.tv': 'Entertainment',
  'app.plex.tv': 'Entertainment',
  'support.plex.tv': 'Entertainment',
  'Chess': 'Entertainment',
  'chess.com': 'Entertainment',
  'Uber Eats': 'Entertainment',
  'Snapchat': 'Entertainment',
  'Reddit': 'Entertainment',
  'One Sec': 'Entertainment',
  'neo.io': 'Entertainment',

  // Communication
  'Messages': 'Communication',
  'Slack': 'Communication',
  'Discord': 'Communication',
  'FaceTime': 'Communication',
  'zoom.us': 'Communication',
  'gmail.com': 'Communication',
  'outlook.com': 'Communication',
  'mail.google.com': 'Communication',
  'wetransfer.com': 'Communication',
  'WhatsApp': 'Communication',
  '‎WhatsApp': 'Communication',
  'Phone Calls': 'Communication',
  'Phone': 'Communication',
  'Messenger': 'Communication',
  'Gmail': 'Communication',
  'Outlook': 'Communication',

  // Education
  'coursera.org': 'Education',
  'udemy.com': 'Education',
  'edx.org': 'Education',
  'wikipedia.org': 'Education',
  'medium.com': 'Education',
  'dev.to': 'Education',
  'felixkohlhas.com': 'Education',
  'ClassPass': 'Education',

  // Brain Rot
  'youtube_brain_rot': 'Brain Rot',
  'youtube_"brain_rot"': 'Brain Rot',
  
  
  'tiktok.com': 'Brain Rot',

  // Shopping
  'amazon.com': 'Shopping',
  'ebay.com': 'Shopping',
  'vinted.nl': 'Shopping',
  'ray-ban.com': 'Shopping',
  'sunglassesid.com': 'Shopping',
  'sunglasshut.com': 'Shopping',
  'oliverpeoples.com': 'Shopping',
  'Vinted': 'Shopping',
  'offers.hotdeals.com': 'Shopping',
  'AliExpress': 'Shopping',

  // Finance
  'Wallet': 'Finance',
  'N26': 'Finance',
  'NLB Bank': 'Finance',
  'CoinMarketCap': 'Finance',

  // System
  'Finder': 'System',
  'System Settings': 'System',
  'loginwindow': 'System',
  'Screen Sharing': 'System',
  'UserNotificationCenter': 'System',
  'TextEdit': 'System',
  'Photos': 'System',
  'Numbers': 'System',
  'VLC': 'System',
  'Calendar': 'System',
  'newtab': 'System',
  'google.com': 'System',
  'Dual Camera': 'System',
  'Settings': 'System',
  'Clock': 'System',
  'Screenshots': 'System',
  'Find My': 'System',
  'Weather': 'System',
  'Google B612': 'System'
};

// Default category for unknown apps
const DEFAULT_CATEGORY = 'Other';

// Helper function to get date range for a specific date
function getDateRangeForDate(targetDate: Date): { startDate: Date, endDate: Date } {
  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0); // Start of the target day
  
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999); // End of the target day
  
  return { startDate, endDate };
}

// Update the existing getDateRange function to handle both days and specific dates
function getDateRange(daysOrDate: number | Date): { startDate: Date, endDate: Date } {
  if (daysOrDate instanceof Date) {
    return getDateRangeForDate(daysOrDate);
  }

  const days = daysOrDate;
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

export function processActivityData(daysOrDate: number | Date = 1): ProcessedActivityData[] {
  // Cast the imported data to the correct type
  const activityLogs: ActivityLog[] = activityLogsData as ActivityLog[];

  // Get date range
  const { startDate, endDate } = getDateRange(daysOrDate);

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
    .sort((a, b) => b.minutes - a.minutes); // Sort by minutes in descending order, but don't limit to top 10

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

export function processActivityLogsForGantt(daysOrDate: number | Date = 1): GanttChartData[] {
  // Cast the imported data to the correct type
  const activityLogs: ActivityLog[] = activityLogsData as ActivityLog[];

  // Get date range
  const { startDate, endDate } = getDateRange(daysOrDate);

  // Filter logs for the date range
  const recentLogs = activityLogs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= startDate && logDate <= endDate;
  });

  // Process each log entry
  const ganttData: GanttChartData[] = [];

  recentLogs.forEach(log => {
    try {
      // Clean up the string to remove array brackets (handle both single and double brackets)
      const cleanTimeline = log.timeline.replace(/^\[+|\]+$/g, '');

      // Extract timeline entries using regex - updated pattern to handle both timestamp formats
      const timelineRegex = /'timestamp': Timestamp\('([^']+?)(?:\+\d{4})?'(?:, tz='UTC')?\), 'duration': Timedelta\('(\d+) days (\d{2}):(\d{2}):(\d{2})(?:\.\d+)?'\)/g;
      let match;
      
      while ((match = timelineRegex.exec(cleanTimeline)) !== null) {
        const [fullMatch, timestamp, days, hours, minutes, seconds] = match;
        
        // Skip very short sessions (less than 30 seconds)
        const totalSeconds = 
          parseInt(days) * 24 * 60 * 60 + 
          parseInt(hours) * 60 * 60 + 
          parseInt(minutes) * 60 + 
          parseInt(seconds);
        
        if (totalSeconds < 30) continue;

        // Create start time and convert to Amsterdam time
        const startTimeUTC = new Date(timestamp);
        const startTime = new Date(formatInTimeZone(startTimeUTC, 'Europe/Amsterdam', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
        
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
    } catch (error) {
      console.error(`Error processing timeline for app ${log.app}:`, error);
    }
  });

  return ganttData;
} 