'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { processActionItems } from '../dataProcessor';

export function ActionItems() {
  const actionItems = processActionItems();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <CardTitle>Action Items</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-medium text-lg mb-4">Common Patterns to Address</h3>
        <div className="space-y-3">
          {actionItems.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${
                item.priority === 'high' ? 'bg-red-50' : 
                item.category === 'fitness' ? 'bg-yellow-50' : 
                item.category === 'projects' ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <p className="font-medium">{item.title}</p>
              <p className="text-gray-600 text-sm mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
