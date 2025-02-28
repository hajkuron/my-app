import React from 'react';
import { TopStats } from './top-stats';
import { ConsistencyChart } from './consistency-chart';
import { CompoundConsistencyChart } from './compound-consistency-chart';
import { MissedCommitments } from './missed-commitments';
import { ActionItems } from './action-items';
import { WeeklyGoals } from './weekly-goals';
import { TaskDistribution } from './task-distribution';
import { PerfectDays } from './perfect-days';
import ScreenTimeChart from '../screen-time-chart';
import GanttChartVisualization, { ScreenTimeData } from './GanttChartVisualization';

// Sample data for the Gantt chart
const sampleScreenTimeData: ScreenTimeData[] = [
  { app: "VS Code", startTime: "2023-05-01T09:00:00", endTime: "2023-05-01T11:30:00", category: "Productivity" },
  { app: "Slack", startTime: "2023-05-01T11:45:00", endTime: "2023-05-01T12:15:00", category: "Productivity" },
  { app: "Chrome (Work)", startTime: "2023-05-01T13:30:00", endTime: "2023-05-01T15:30:00", category: "Productivity" },
  { app: "Figma", startTime: "2023-05-01T15:45:00", endTime: "2023-05-01T17:30:00", category: "Productivity" },
  { app: "Netflix", startTime: "2023-05-01T20:00:00", endTime: "2023-05-01T22:00:00", category: "Entertainment" },
  { app: "Spotify", startTime: "2023-05-01T22:15:00", endTime: "2023-05-01T23:30:00", category: "Entertainment" },
  { app: "TikTok", startTime: "2023-05-01T07:00:00", endTime: "2023-05-01T07:45:00", category: "Brain Rot" },
  { app: "Instagram", startTime: "2023-05-01T12:30:00", endTime: "2023-05-01T13:15:00", category: "Brain Rot" },
  { app: "YouTube (non-educational)", startTime: "2023-05-01T18:00:00", endTime: "2023-05-01T19:30:00", category: "Brain Rot" },
];

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50">
      <div className="absolute top-4 right-8">
        <span className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          JK
        </span>
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
          MONK MODE
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          January - June 2025: Six Months of Deliberate Growth
        </p>
      </div>

      <TopStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ConsistencyChart />
        <CompoundConsistencyChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MissedCommitments />
        <ActionItems />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <WeeklyGoals />
        <TaskDistribution />
        <PerfectDays />
      </div>
      
      <div className="mb-6">
        <ScreenTimeChart />
      </div>

      <div className="mb-6">
        <GanttChartVisualization data={sampleScreenTimeData} />
      </div>
      
      <div className="mb-6 rounded-lg overflow-hidden">
        <iframe
          src="https://hajkuron.github.io/notion-githubchart/"
          className="w-full h-[600px] border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
