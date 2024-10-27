export const consistencyData = Array(30).fill(0).map((_, i) => ({
  day: i + 1,
  completion: 65 + Math.random() * 25,
  sevenDayAvg: 75 + Math.random() * 10,
  thirtyDayAvg: 80 + Math.random() * 5
}));

export const missedCommitments = [
  {
    id: 1,
    activity: "Deep Work Session",
    time: "09:00 - 11:00",
    day: "Monday",
    pattern: "3rd time this month",
    reflection: "Planned too early, consistently struggling with morning focus",
    impact: "high"
  },
  {
    id: 2,
    activity: "Evening Workout",
    time: "18:00 - 19:00",
    day: "Wednesday",
    pattern: "Often skipped when work runs late",
    reflection: "Need buffer between work and workout",
    impact: "medium"
  },
  {
    id: 3,
    activity: "Learning React",
    time: "20:00 - 21:30",
    day: "Tuesday",
    pattern: "2nd time this week",
    reflection: "Too tired for focused learning this late",
    impact: "high"
  }
];

export const actionItems = [
  {
    title: "Morning Deep Work (High Priority)",
    description: "Consider moving to late morning when energy is higher",
    priority: "high",
    category: "work"
  },
  {
    title: "Evening Workouts",
    description: "Add 30min buffer after work ends",
    priority: "medium",
    category: "fitness"
  },
  {
    title: "Late Night Learning",
    description: "Try switching with evening workout slot",
    priority: "medium",
    category: "learning"
  }
];

export const wakeUpData = Array(7).fill(0).map((_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  time: 6 + Math.random(),
  target: 6.5
}));

export const taskDistributionData = [
  { name: 'Work', planned: 8, actual: 7.5 },
  { name: 'Exercise', planned: 2, actual: 1.5 },
  { name: 'Learning', planned: 3, actual: 2 },
  { name: 'Social', planned: 2, actual: 2.5 },
  { name: 'Other', planned: 1, actual: 1.5 },
];

export const trendData = {
  percentage: 12,
  label: "30-Day Trend",
  comparison: "vs. previous 30 days"
};