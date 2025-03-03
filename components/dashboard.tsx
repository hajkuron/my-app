'use client';

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
import GanttChartVisualization from './GanttChartVisualization';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshTime, setLastRefreshTime] = React.useState<string | null>(null);

  const handleRefresh = async () => {
    console.log('[Frontend] Starting refresh operation...');
    setIsRefreshing(true);
    
    try {
      console.log('[Frontend] Making request to /api/refresh...');
      const response = await fetch('/api/refresh', {
        method: 'POST',
      });
      
      console.log('[Frontend] Response status:', response.status);
      const data = await response.json();
      console.log('[Frontend] Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh data');
      }
      
      setLastRefreshTime(new Date().toLocaleTimeString());
      console.log('[Frontend] Refresh completed successfully');
      
    } catch (error) {
      console.error('[Frontend] Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50">
      <div className="absolute top-4 right-16 flex items-center gap-6">
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </Button>
          {lastRefreshTime && (
            <span className="text-xs text-gray-500">
              Last refreshed: {lastRefreshTime}
            </span>
          )}
        </div>
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
        <GanttChartVisualization />
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
