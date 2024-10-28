'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { processPerfectDays } from '../dataProcessor';

export function PerfectDays() {
  const perfectDays = processPerfectDays();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <CardTitle>Perfect Days</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {perfectDays.map((day) => (
            <div 
              key={day.date} 
              className={`aspect-square rounded-md flex items-center justify-center text-sm
                ${day.isPerfect ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}
                hover:bg-opacity-80 transition-colors cursor-default`}
              title={`${day.date}${day.isPerfect ? ' - Perfect Day!' : ''}`}
            >
              {day.dayNumber}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
