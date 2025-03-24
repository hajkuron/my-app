import { CalendarEvent } from './types';
import calendarEventsData from './data/calendarEvents.json';

// Assert the type of the imported data
const calendarEvents: CalendarEvent[] = calendarEventsData as CalendarEvent[];

export function calculateAverageWakeUpTime(): string {
  const wakeUpEvents = calendarEvents.filter(event => 
    event.calendar_name === "jonkuhar11@gmail.com" &&
    event.summary.toLowerCase() === "wake up" &&
    !event.deleted
  );

  if (wakeUpEvents.length === 0) {
    return "0:00"; // Return "0:00" if no wake-up events found
  }

  const totalMinutes = wakeUpEvents.reduce((sum, event) => {
    const startTime = new Date(event.start);
    return sum + startTime.getHours() * 60 + startTime.getMinutes();
  }, 0);

  const averageMinutes = totalMinutes / wakeUpEvents.length;
  const hours = Math.floor(averageMinutes / 60);
  const minutes = Math.round(averageMinutes % 60);

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

export interface MissedCommitment {
  id: number;
  activity: string;
  time: string;
  day: string;
  pattern: string;
  reflection: string;
  impact: "low" | "medium" | "high";
}

// Helper function to check if an event was significantly modified
function isSignificantlyModified(event: CalendarEvent, threshold: number = 0.25): boolean {
  if (event.status !== "modified") return false;
  
  const plannedDuration = new Date(event.end).getTime() - new Date(event.start).getTime();
  const actualDuration = new Date(event.new_end).getTime() - new Date(event.new_start).getTime();
  const durationDifference = plannedDuration - actualDuration;
  
  // Return true if actual duration was significantly shorter (by threshold %)
  return durationDifference / plannedDuration > threshold;
}

export function processMissedCommitments(): MissedCommitment[] {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const missedEvents = calendarEvents.filter(event => 
    (event.status === "deleted" || isSignificantlyModified(event)) &&
    new Date(event.date) >= oneWeekAgo
  );

  return missedEvents.map((event, index) => {
    const startTime = new Date(event.start);
    const endTime = new Date(event.end);
    const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' });

    // Add more context for modified events
    const reflection = event.status === "deleted" 
      ? generateReflection(event)
      : `Significantly shortened: ${formatDuration(event.start, event.end)} planned vs ${formatDuration(event.new_start, event.new_end)} actual`;

    return {
      id: index + 1,
      activity: event.summary,
      time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      day: dayOfWeek,
      pattern: determinePattern(event, missedEvents),
      reflection,
      impact: determineImpact(event)
    };
  });
}

// Helper function to format duration
function formatDuration(start: string, end: string): string {
  const duration = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60);
  const hours = Math.floor(duration / 60);
  const minutes = Math.round(duration % 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function determinePattern(event: CalendarEvent, allMissedEvents: CalendarEvent[]): string {
  const similarEvents = allMissedEvents.filter(e => e.summary === event.summary);
  if (similarEvents.length > 2) {
    return `${ordinal(similarEvents.length)} time this month`;
  } else if (similarEvents.length === 2) {
    return "2nd time this week";
  } else {
    return "First occurrence";
  }
}

function generateReflection(event: CalendarEvent): string {
  const startHour = new Date(event.start).getHours();
  if (startHour < 9) {
    return "Planned too early, consistently struggling with morning focus";
  } else if (startHour >= 19) {
    return "Too tired for focused activity this late";
  } else {
    return "Need to investigate reasons for missing this commitment";
  }
}

function determineImpact(event: CalendarEvent): "low" | "medium" | "high" {
  const duration = event.duration;
  if (duration > 120) return "high";
  if (duration > 60) return "medium";
  return "low";
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function processWakeUpData(): { day: string; planned: number; actual: number }[] {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 8);

  const wakeUpEvents = calendarEvents.filter(event => 
    event.calendar_name === "jonkuhar11@gmail.com" &&
    event.summary.toLowerCase() === "wake up" &&
    new Date(event.date) >= oneWeekAgo
  );

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const wakeUpData = weekDays.map(day => ({
    day,
    planned: 0,
    actual: 0
  }));

  wakeUpEvents.forEach(event => {
    const plannedDate = new Date(event.start);
    const actualDate = new Date(event.new_start || event.start);
    const dayIndex = plannedDate.getDay();

    wakeUpData[dayIndex].planned = plannedDate.getHours() + plannedDate.getMinutes() / 60;
    wakeUpData[dayIndex].actual = actualDate.getHours() + actualDate.getMinutes() / 60;
  });

  // Reorder the array to start from the current day
  const today = new Date().getDay();
  return [...wakeUpData.slice(today), ...wakeUpData.slice(0, today)];
}

export function processTaskDistribution(timeframe: 'weekly' | 'monthly' = 'weekly'): { name: string; planned: number; actual: number }[] {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (timeframe === 'weekly' ? 7 : 30));

  const relevantEvents = calendarEvents.filter(event => 
    (event.calendar_name === "Fitness" || 
     event.calendar_name === "Projects" || 
     event.calendar_name === "Learning") &&
    new Date(event.date) >= startDate
  );

  const taskDistribution = {
    Fitness: { planned: 0, actual: 0 },
    Projects: { planned: 0, actual: 0 },
    Learning: { planned: 0, actual: 0 }
  };

  relevantEvents.forEach(event => {
    const plannedDuration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60 * 60);

    if (event.status === "deleted") {
      // For deleted events, only add to planned duration
      taskDistribution[event.calendar_name as keyof typeof taskDistribution].planned += plannedDuration;
    } else {
      // For non-deleted events, calculate both planned and actual durations
      const actualDuration = (new Date(event.new_end).getTime() - new Date(event.new_start).getTime()) / (1000 * 60 * 60);

      taskDistribution[event.calendar_name as keyof typeof taskDistribution].planned += plannedDuration;
      taskDistribution[event.calendar_name as keyof typeof taskDistribution].actual += actualDuration;
    }
  });

  return [
    { name: 'Fitness', planned: taskDistribution.Fitness.planned, actual: taskDistribution.Fitness.actual },
    { name: 'Projects', planned: taskDistribution.Projects.planned, actual: taskDistribution.Projects.actual },
    { name: 'Learning', planned: taskDistribution.Learning.planned, actual: taskDistribution.Learning.actual }
  ];
}

interface DailyConsistency {
  day: number;
  date: string;
  completion: number;
  sevenDayAvg: number;
  thirtyDayAvg: number;
}

export function processConsistencyData(): DailyConsistency[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Get weekly goals data
  const weeklyGoals = new Map<string, number>();
  calendarEvents.forEach(event => {
    if (event.calendar_name === "Goals") {
      const goalDate = new Date(event.date);
      const weekStart = new Date(goalDate);
      weekStart.setDate(goalDate.getDate() - 6);
      
      const goalsAchieved = Number(event.summary);
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        let goalAdjustment;
        if (goalsAchieved === 5) {
          goalAdjustment = 15;
        } else if (goalsAchieved === 4) {
          goalAdjustment = -5;
        } else if (goalsAchieved === 3) {
          goalAdjustment = -10;
        } else if (goalsAchieved === 2) {
          goalAdjustment = -15;
        } else if (goalsAchieved === 1) {
          goalAdjustment = -20;
        } else {
          goalAdjustment = -30;
        }
        
        weeklyGoals.set(dateKey, goalAdjustment);
      }
    }
  });

  // Group events by date
  const eventsByDate = new Map<string, CalendarEvent[]>();
  
  calendarEvents.forEach(event => {
    const dateKey = event.date.split('T')[0];
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)?.push(event);
  });

  // Calculate daily consistency scores with goal penalties
  const dailyScores: { date: string; score: number }[] = [];

  eventsByDate.forEach((events, date) => {
    const totalPlannedMinutes = events.reduce((sum, event) => {
      const duration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60);
      return sum + duration;
    }, 0);

    let consistencyScore = 100;

    events.forEach(event => {
      if (event.status === "deleted") {
        const deletedDuration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60);
        const impactPercentage = (deletedDuration / totalPlannedMinutes) * 100;
        consistencyScore -= impactPercentage;
      } else if (event.status === "modified") {
        const plannedDuration = (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60);
        const actualDuration = (new Date(event.new_end).getTime() - new Date(event.new_start).getTime()) / (1000 * 60);
        const durationDifference = Math.abs(plannedDuration - actualDuration);
        const impactPercentage = (durationDifference / totalPlannedMinutes) * 50;
        consistencyScore -= impactPercentage;
      }
    });

    const goalAdjustment = weeklyGoals.get(date) || 0;
    consistencyScore = Math.max(0, Math.min(100, consistencyScore + goalAdjustment));

    dailyScores.push({
      date,
      score: Math.max(0, Math.min(100, consistencyScore))
    });
  });

  // Sort by date
  dailyScores.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate rolling averages and format final data
  return dailyScores.map((dayScore, index) => {
    const previous7Days = dailyScores.slice(Math.max(0, index - 6), index + 1);
    const previous30Days = dailyScores.slice(Math.max(0, index - 29), index + 1);

    const sevenDayAvg = previous7Days.reduce((sum, day) => sum + day.score, 0) / previous7Days.length;
    const thirtyDayAvg = previous30Days.reduce((sum, day) => sum + day.score, 0) / previous30Days.length;

    return {
      day: index + 1,
      date: dayScore.date,
      completion: Number(dayScore.score.toFixed(2)),
      sevenDayAvg: Number(sevenDayAvg.toFixed(2)),
      thirtyDayAvg: Number(thirtyDayAvg.toFixed(2))
    };
  });
}

export function calculateWeeklyStats() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weekEvents = calendarEvents.filter(event => 
    new Date(event.date) >= oneWeekAgo
  );

  let totalPlannedMinutes = 0;
  let totalActualMinutes = 0;
  let deletedEvents = 0;
  let totalEvents = weekEvents.length;
  let perfectDays = 0;

  // Group events by date to calculate perfect days
  const eventsByDate = new Map<string, CalendarEvent[]>();
  weekEvents.forEach(event => {
    const dateKey = event.date.split('T')[0];
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)?.push(event);
  });

  // Calculate perfect days and overall completion
  eventsByDate.forEach((dayEvents, date) => {
    let isDayPerfect = true;
    
    dayEvents.forEach(event => {
      const plannedDuration = (new Date(event.end).getTime() - new Date(event.start).getTime());
      totalPlannedMinutes += plannedDuration / (1000 * 60);

      if (event.status === "deleted") {
        isDayPerfect = false;
        deletedEvents++;
        // Don't add to actual minutes for deleted events
      } else {
        const actualDuration = (new Date(event.new_end).getTime() - new Date(event.new_start).getTime());
        totalActualMinutes += actualDuration / (1000 * 60);

        // Check if the event was modified significantly (more than 20% difference)
        if (event.status === "modified") {
          const durationDifference = Math.abs(plannedDuration - actualDuration);
          if (durationDifference / plannedDuration > 0.2) { // 20% threshold
            isDayPerfect = false;
          }
        }
      }
    });

    if (isDayPerfect && dayEvents.length > 0) {
      perfectDays++;
    }
  });

  const weeklyCompletion = totalPlannedMinutes > 0 
    ? Math.round((totalActualMinutes / totalPlannedMinutes) * 100)
    : 100;

  const canceledPercentage = totalEvents > 0
    ? Math.round((deletedEvents / totalEvents) * 100)
    : 0;

  return {
    weeklyCompletion: Math.min(100, weeklyCompletion), // Cap at 100%
    perfectDays,
    canceledPercentage
  };
}

interface ActionItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export function processActionItems(): ActionItem[] {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const problematicEvents = calendarEvents.filter(event => 
    (event.status === "deleted" || isSignificantlyModified(event)) &&
    new Date(event.date) >= thirtyDaysAgo
  );

  // Group events by activity summary
  const patterns = new Map<string, CalendarEvent[]>();
  problematicEvents.forEach(event => {
    const key = event.calendar_name.toLowerCase();
    if (!patterns.has(key)) {
      patterns.set(key, []);
    }
    patterns.get(key)?.push(event);
  });

  const actionItems: ActionItem[] = [];

  // Analyze patterns by time of day
  const morningIssues = problematicEvents.filter(e => new Date(e.start).getHours() < 10);
  const eveningIssues = problematicEvents.filter(e => new Date(e.start).getHours() >= 18);

  if (morningIssues.length >= 3) {
    actionItems.push({
      title: "Morning Commitment Struggles",
      description: `${morningIssues.length} early commitments missed or significantly shortened. Consider adjusting morning schedule.`,
      priority: "high",
      category: "schedule"
    });
  }

  // Add specific action item for modified events
  const significantlyModified = problematicEvents.filter(e => isSignificantlyModified(e));
  if (significantlyModified.length >= 3) {
    actionItems.push({
      title: "Duration Planning Issues",
      description: `${significantlyModified.length} activities significantly shortened. Consider more realistic duration planning.`,
      priority: significantlyModified.length >= 5 ? "high" : "medium",
      category: "planning"
    });
  }

  // Analyze patterns by activity type
  patterns.forEach((events, activity) => {
    if (events.length >= 3) {
      // Determine the most common calendar for this activity
      const calendarCounts = events.reduce((acc, event) => {
        acc[event.calendar_name] = (acc[event.calendar_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostCommonCalendar = Object.entries(calendarCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      actionItems.push({
        title: `Recurring "${activity}" Challenges`,
        description: `${events.length} ${activity} sessions missed across calendars. Review scheduling and commitment approach.`,
        priority: events.length >= 5 ? "high" : "medium",
        category: mostCommonCalendar.toLowerCase()
      });
    }
  });

  // Add duration-based patterns
  const longDurationMisses = problematicEvents.filter(e => {
    const duration = (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60);
    return duration >= 90;
  });

  if (longDurationMisses.length >= 5) {
    actionItems.push({
      title: "Long Duration Activity Issues",
      description: "Multiple long sessions missed. Consider breaking into shorter segments.",
      priority: "high",
      category: "schedule"
    });
  }

  return actionItems.sort((a, b) => 
    a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
  );
}

export function processHeatmapData() {
  // Process your calendar events into intensity levels
  const lowIntensity: Date[] = [];
  const mediumIntensity: Date[] = [];
  const highIntensity: Date[] = [];

  calendarEvents.forEach(event => {
    const date = new Date(event.date);
    
    // Categorize based on duration or other metrics
    if (event.duration > 240) { // More than 4 hours
      highIntensity.push(date);
    } else if (event.duration > 120) { // More than 2 hours
      mediumIntensity.push(date);
    } else {
      lowIntensity.push(date);
    }
  });

  return {
    datesPerVariant: [lowIntensity, mediumIntensity, highIntensity]
  };
}

export interface TrendData {
  label: string;
  percentage: number;
  comparison: string;
  timeframe: 'weekly' | 'monthly';
}

export function calculateTrends(): TrendData[] {
  const today = new Date();
  
  // Weekly date ranges
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Monthly date ranges
  const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Weekly calculations
  const currentWeekEvents = calendarEvents.filter(event => 
    new Date(event.date) >= oneWeekAgo && new Date(event.date) <= today
  );
  const previousWeekEvents = calendarEvents.filter(event => 
    new Date(event.date) >= twoWeeksAgo && new Date(event.date) < oneWeekAgo
  );

  // Monthly calculations
  const currentMonthEvents = calendarEvents.filter(event => 
    new Date(event.date) >= oneMonthAgo && new Date(event.date) <= today
  );
  const previousMonthEvents = calendarEvents.filter(event => 
    new Date(event.date) >= twoMonthsAgo && new Date(event.date) < oneMonthAgo
  );

  const weeklyTrend = calculateTrendData(
    currentWeekEvents,
    previousWeekEvents,
    "Weekly Progress",
    'weekly'
  );

  const monthlyTrend = calculateTrendData(
    currentMonthEvents,
    previousMonthEvents,
    "Monthly Progress",
    'monthly'
  );

  return [weeklyTrend, monthlyTrend];
}

function calculateTrendData(
  currentEvents: CalendarEvent[],
  previousEvents: CalendarEvent[],
  label: string,
  timeframe: 'weekly' | 'monthly'
): TrendData {
  const currentCompletion = calculateCompletionRate(currentEvents);
  const previousCompletion = calculateCompletionRate(previousEvents);

  const percentageChange = previousCompletion === 0 
    ? currentCompletion 
    : ((currentCompletion - previousCompletion) / previousCompletion) * 100;

  return {
    label,
    percentage: Math.round(percentageChange),
    comparison: `vs last ${timeframe === 'weekly' ? 'week' : 'month'} (${Math.round(previousCompletion)}%)`,
    timeframe
  };
}

function calculateCompletionRate(events: CalendarEvent[]): number {
  if (events.length === 0) return 0;

  const completedEvents = events.filter(event => event.status !== "deleted").length;
  return (completedEvents / events.length) * 100;
}

export interface PerfectDayData {
  date: string;
  isPerfect: boolean;
  dayNumber: number;
}

export function processPerfectDays(): PerfectDayData[] {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 28); // Get last 28 days
  
  const perfectDays: PerfectDayData[] = [];
  const currentDate = new Date();

  // Group events by date
  const eventsByDate = new Map<string, CalendarEvent[]>();
  
  calendarEvents.forEach(event => {
    const eventDate = new Date(event.date);
    if (eventDate >= thirtyDaysAgo && eventDate <= currentDate) {
      const dateKey = event.date.split('T')[0];
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)?.push(event);
    }
  });

  // Iterate through the last 28 days
  for (let i = 0; i < 28; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    let isPerfect = true;
    
    if (dayEvents.length > 0) {
      dayEvents.forEach(event => {
        if (event.status === "deleted") {
          isPerfect = false;
        } else if (event.status === "modified") {
          // Check if modification was significant (>20% time difference)
          const plannedDuration = new Date(event.end).getTime() - new Date(event.start).getTime();
          const actualDuration = new Date(event.new_end).getTime() - new Date(event.new_start).getTime();
          const durationDifference = Math.abs(plannedDuration - actualDuration);
          if (durationDifference / plannedDuration > 0.2) {
            isPerfect = false;
          }
        }
      });
    } else {
      // If no events on this day, consider it not perfect
      isPerfect = false;
    }

    perfectDays.push({
      date: dateKey,
      isPerfect,
      dayNumber: i + 1
    });
  }

  return perfectDays;
}

interface CompoundedConsistencyData {
  day: number;
  compoundedActual: number;
  perfectCompound: number;
}

export function processCompoundConsistencyData(): CompoundedConsistencyData[] {
  const consistencyData = processConsistencyData();
  let runningSum = 0;
  let perfectSum = 0;
  
  return consistencyData.map((dayData, index) => {
    // Add today's actual consistency to running sum
    runningSum += dayData.completion;
    
    // Add 100 to perfect running sum
    perfectSum += 100;

    return {
      day: dayData.day,
      compoundedActual: Number((runningSum / 10).toFixed(2)),
      perfectCompound: perfectSum / 10
    };
  });
}

export interface WeeklyGoalData {
  week: string;
  achieved: number;
  total: number;
}

export function processWeeklyGoalsData(): WeeklyGoalData[] {
  const goals = calendarEvents.filter(event => event.calendar_name === "Goals");

  return goals.map(event => {
    const date = new Date(event.date);
    return {
      week: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      achieved: Number(event.summary),
      total: 5
    };
  }).slice(-4);
}
