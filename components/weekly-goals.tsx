'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { processWeeklyGoalsData } from '../dataProcessor';

interface CustomBarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
}

export function WeeklyGoals() {
  const weeklyGoals = processWeeklyGoalsData();
  
  // Sort the goals by date ascending
  const sortedGoals = [...weeklyGoals].sort((a, b) => {
    const dateA = new Date(a.week);
    const dateB = new Date(b.week);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Calculate the average of achieved goals
  const average = sortedGoals.reduce((sum, goal) => sum + goal.achieved, 0) / sortedGoals.length;
  
  console.log('Sorted Weekly Goals Data:', sortedGoals);
  console.log('Average achievement:', average);

  // Function to determine bar color based on achievement level
  const getBarColor = (value: number) => {
    if (value >= 4) return '#22c55e'; // Green for excellent
    if (value >= 3) return '#eab308'; // Yellow for acceptable
    return '#ef4444'; // Red for below target
  };

  // Custom bar component to apply dynamic colors
  const CustomBar = (props: CustomBarProps) => {
    const { x, y, width, height, value } = props;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={getBarColor(value)}
          rx={4}
          ry={4}
        />
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <CardTitle>Weekly Goals</CardTitle>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Excellent (4-5)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Good (3)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Below Target (&lt;3)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sortedGoals}>
            <XAxis 
              dataKey="week"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [`${value} goals`, 'Achieved']}
              labelFormatter={(label: string) => `Week of ${label}`}
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px'
              }}
            />
            <ReferenceLine 
              y={average} 
              stroke="#94a3b8" 
              strokeDasharray="3 3"
              label={{ 
                value: `Avg: ${average.toFixed(1)}`,
                position: 'right',
                fill: '#94a3b8',
                fontSize: 12
              }}
            />
            <Bar 
              dataKey="achieved" 
              shape={<CustomBar />}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}