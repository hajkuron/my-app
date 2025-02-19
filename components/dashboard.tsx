import React from 'react';
import { TopStats } from './top-stats';
import { ConsistencyChart } from './consistency-chart';
import { CompoundConsistencyChart } from './compound-consistency-chart';
import { MissedCommitments } from './missed-commitments';
import { ActionItems } from './action-items';
import { WeeklyGoals } from './weekly-goals';
import { TaskDistribution } from './task-distribution';
import { PerfectDays } from './perfect-days';

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
