'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { ArrowUpRight } from 'lucide-react';
import { trendData } from './dashboard-data';
import { calculateAverageWakeUpTime, calculateWeeklyStats } from '../dataProcessor';

export function TopStats() {
  const averageWakeUpTime = calculateAverageWakeUpTime();
  const { weeklyCompletion, perfectDays, canceledPercentage } = calculateWeeklyStats();

  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="col-span-2 md:col-span-1 lg:col-span-1">
        <CardContent className="flex flex-col justify-center h-full p-6">
          <CardTitle className="text-sm font-medium text-muted-foreground mb-2">{trendData.label}</CardTitle>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-green-600">+{trendData.percentage}%</span>
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">{trendData.comparison}</p>
        </CardContent>
      </Card>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-blue-600">{weeklyCompletion}%</div>
        <div className="text-sm text-gray-600">Weekly Completion</div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-green-600">{averageWakeUpTime}</div>
        <div className="text-sm text-gray-600">Avg Wake Time</div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-yellow-600">{perfectDays}</div>
        <div className="text-sm text-gray-600">Perfect Days</div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="text-2xl font-bold text-red-600">{canceledPercentage}%</div>
        <div className="text-sm text-gray-600">Tasks Canceled</div>
      </div>
    </div>
  );
}
