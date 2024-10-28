'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';
import { processTaskDistribution } from '@/dataProcessor';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function TaskDistribution() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const data = processTaskDistribution(timeframe);

  // Calculate max value for X-axis based on timeframe
  const maxValue = Math.max(...data.map(d => Math.max(d.planned, d.actual)));
  const xAxisTicks = [0, maxValue / 3, (2 * maxValue) / 3, maxValue];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Task Distribution</h2>
                <p className="text-sm text-muted-foreground">Hours allocated vs actual spent</p>
              </div>
            </div>
            
            <ToggleGroup type="single" value={timeframe} onValueChange={(value) => value && setTimeframe(value as 'weekly' | 'monthly')}>
              <ToggleGroupItem value="weekly" aria-label="Weekly view">
                Weekly
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Monthly view">
                Monthly
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Legend */}
          <div className="flex justify-end items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-rose-300 rounded"></div>
              <span className="text-muted-foreground">Planned</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Actual</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              barGap={8}
              margin={{ top: 0, right: 40, bottom: 0, left: -40 }}
            >
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                ticks={xAxisTicks}
                tickFormatter={(value) => `${Math.round(value)}h`}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                style={{ fontSize: '14px' }}
                width={120}
              />
              <Bar
                dataKey="planned"
                fill="#fda4af"
                radius={[0, 4, 4, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="actual"
                fill="#16a34a"
                radius={[0, 4, 4, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
