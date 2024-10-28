'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { processCompoundConsistencyData } from '../dataProcessor';

export function CompoundConsistencyChart() {
  const compoundedData = processCompoundConsistencyData();

  // Add this function to calculate performance
  const calculatePerformance = () => {
    if (!compoundedData.length) return null;
    
    const lastDay = compoundedData[compoundedData.length - 1];
    const ratio = lastDay.compoundedActual / lastDay.perfectCompound;
    
    if (ratio >= 0.95) return { message: "Monk 🧘🏽‍♂️ ", color: "text-green-600" };
    if (ratio >= 0.8) return { message: "Focus more! 💪", color: "text-blue-600" };
    return { message: "Keep pushing forward! 🎯", color: "text-gray-600" };
  };

  const performance = calculatePerformance();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <CardTitle>Compound Effect</CardTitle>
            </div>
            <div className="text-sm text-gray-600">Daily Compound</div>
          </div>
          {performance && (
            <div className={`text-sm font-medium ${performance.color}`}>
              {performance.message}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={compoundedData}>
            <XAxis dataKey="day" />
            <YAxis 
              domain={['dataMin', 'dataMax']}
            >
              <Label
                value={performance?.message || ''}
                position="top"
                offset={20}
                content={({ value }) => (
                  <text
                    x="50%"
                    y={30}
                    fill={performance?.color.replace('text-', '').replace('-600', '')}
                    textAnchor="middle"
                    className="font-medium text-base"
                    style={{ 
                      fontWeight: 700,  // Makes text bold
                      fontSize: '1.5rem' // Makes text bigger
                    }}
                  >
                    {value}
                  </text>
                )}
              />
            </YAxis>
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}`, '']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="compoundedActual" 
              stroke="#4f46e5" 
              name="Your Progress" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="perfectCompound" 
              stroke="#FFD700" // Changed to golden color
              name="Perfect Consistency" 
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
