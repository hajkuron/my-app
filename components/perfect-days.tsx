'use client';

import React from 'react';
import { Card, CardContent, 

 CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export function PerfectDays() {
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
          {Array(28).fill(0).map((_, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-md flex items-center justify-center text-sm
                ${Math.random() > 0.8 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}