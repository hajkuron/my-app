import React from 'react';
import { TopStats } from './top-stats';
import { ConsistencyChart } from './consistency-chart';
import { MissedCommitments } from './missed-commitments';
import { ActionItems } from './action-items';
import { WakeUpPattern } from './wake-up-pattern';
import { TaskDistribution } from './task-distribution';
import { PerfectDays } from './perfect-days';

export default function Dashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50">
      <TopStats />
      <ConsistencyChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MissedCommitments />
        <ActionItems />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WakeUpPattern />
        <TaskDistribution />
        <PerfectDays />
      </div>
    </div>
  );
}