'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { processTaskDistribution } from '../dataProcessor';

export function TaskDistribution() {
  const taskDistributionData = processTaskDistribution();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <CardTitle>Task Distribution (Hours)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            planned: {
              label: "Planned",
              color: "hsl(var(--chart-1))",
            },
            actual: {
              label: "Actual",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskDistributionData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="planned" fill="var(--color-planned)" />
              <Bar dataKey="actual" fill="var(--color-actual)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
