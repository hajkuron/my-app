import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { processMissedCommitments } from '../dataProcessor';

export function MissedCommitments() {
  const missedCommitments = processMissedCommitments();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle>Recent Missed Commitments</CardTitle>
          </div>
          <div className="text-sm text-red-500 font-medium">
            Requires Attention
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {missedCommitments.map((commitment) => (
            <div key={commitment.id} className="p-4 bg-white rounded-lg border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{commitment.activity}</h3>
                  <p className="text-gray-600 text-sm">{commitment.day} • {commitment.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  commitment.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {commitment.impact} impact
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Pattern:</span> {commitment.pattern}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reflection:</span> {commitment.reflection}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
