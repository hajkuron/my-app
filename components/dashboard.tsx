import React from 'react';
import { TopStats } from './top-stats';
import { ConsistencyChart } from './consistency-chart';
import { CompoundConsistencyChart } from './compound-consistency-chart';
import { MissedCommitments } from './missed-commitments';
import { ActionItems } from './action-items';
import { WakeUpPattern } from './wake-up-pattern';
import { TaskDistribution } from './task-distribution';
import { PerfectDays } from './perfect-days';

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50">
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
        <WakeUpPattern />
        <TaskDistribution />
        <PerfectDays />
      </div>
      {/* Moved iframe to bottom and increased height */}
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
