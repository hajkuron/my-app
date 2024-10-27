'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Timer } from 'lucide-react';
import { processWakeUpData } from '../dataProcessor';

export function WakeUpPattern() {
  const wakeUpData = processWakeUpData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Timer className="w-5 h-5" />
          <CardTitle>Wake-up Pattern (Last 7 Days)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={wakeUpData}>
            <XAxis dataKey="day" />
            <YAxis 
              domain={[5, 8]} 
              ticks={[5, 5.5, 6, 6.5, 7, 7.5, 8]}
              tickFormatter={(value) => `${Math.floor(value)}:${Math.round((value % 1) * 60).toString().padStart(2, '0')}`}
            />
            <Tooltip 
              formatter={(value: number) => {
                const hours = Math.floor(value);
                const minutes = Math.round((value - hours) * 60);
                return `${hours}:${minutes.toString().padStart(2, '0')}`;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="planned" 
              stroke="#94a3b8" 
              strokeDasharray="5 5" 
              dot={{ fill: '#94a3b8', r: 4 }}
              name="Planned" 
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#4f46e5" 
              strokeWidth={2}
              dot={{ fill: '#4f46e5', r: 4 }}
              name="Actual" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
