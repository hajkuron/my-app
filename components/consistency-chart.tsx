'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { processConsistencyData } from '../dataProcessor';

export function ConsistencyChart() {
  const consistencyData = processConsistencyData();
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <CardTitle>Consistency Trends</CardTitle>
          </div>
          <div className="text-sm text-gray-600">Last 30 Days</div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={consistencyData}>
            <XAxis dataKey="day" />
            <YAxis domain={[50, 100]} />
            <Tooltip 
              formatter={(value: number) => value.toFixed(2)}
              labelFormatter={(day: number) => {
                const dataPoint = consistencyData.find(d => d.day === day);
                return dataPoint ? new Date(dataPoint.date).toLocaleDateString('en-US', { 
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : '';
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="completion" stroke="#4f46e5" name="Daily" dot={false} />
            <Line type="monotone" dataKey="sevenDayAvg" stroke="#94a3b8" name="7-Day Avg" dot={false} />
            <Line type="monotone" dataKey="thirtyDayAvg" stroke="#cbd5e1" name="30-Day Avg" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
